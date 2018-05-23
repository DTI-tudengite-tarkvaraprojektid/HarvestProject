<?php

require "config.php";

$action = "post_list";	
if(isset($_GET['action']) && $_GET['action']) {
	$action = $_GET['action'];
}

session_start();

switch($action) {
    case "gameStarted" : 
        if(isset($_GET["game_id"])) {
            echo json_encode(gameStarted($_GET["game_id"]));
        }
        break;

    case "gameStats":
        if(isset($_GET["game_id"])) {
            echo json_encode(gamestats($_GET["game_id"]));
        }
        break;

    case "playersReady":
        if(isset($_GET["game_id"])) {
            echo json_encode(playersReady($_GET["game_id"]));
        }
        break;

    case "getPlayers":
        if(isset($_GET["game_id"])) {
            echo json_encode(gerPlayers($_GET["game_id"]));
        }
        break;

    case "login":
        if(isset($_POST["username"]) && isset($_POST['password'])) {
			echo json_encode(login($_POST['username'], $_POST['password']));
            //kontrollib username ja parooli õigsust.
            // return(1,0)
        }
        break;

    case "startGame":
        if (isset($_SESSION["loggedIn"])){
            if(isset($_POST["submit"])) {
                if(is_numeric($_GET["game_id"])){
                    echo json_encode(startGame($_GET["game_id"]));
                }
            }
        }
        break;

    case "createGame":
        if (isset($_SESSION["loggedIn"])){
            if(isset($_POST["submit"])) {
                echo json_encode(createGame());
            }
        }
        break;
        
    case "submitFish":
        if(isset($_POST["submit"]) && isset($_POST['game_id']) && isset($_POST['playerFish']) ) {
            echo json_encode(gameStats($game_id));
            echo json_encode(submitFish($_POST["game_id"], $_POST['playerFish']));
        }
        break;

    case "roundOver":
        if(isset($_POST['game_id'])) { 
            echo json_encode(roundOver($_POST['game_id'])); 
        }
        break;

    case "joinGame":
        if(isset($_POST["gameCode"]) && isset($_POST["teamName"])) {
            echo json_encode(joinGame($_POST["gameCode"], $_POST["teamName"]));
        }
        break;
}

function login($username, $password){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]);
    $stmt= $mysqli->prepare("SELECT id, username, password FROM users WHERE username = ?");
	$stmt->bind_param("s", $username);
	$stmt->bind_result($id, $username, $passwordDB);
	$stmt->execute();

    if($stmt->fetch()){
        if(hash("sha512", $password) == $passwordDB){	
			$_SESSION["loggedIn"] = $loggedIn;
	}
    $stmt->close();
	$mysqli->close();
    if(isset ($_SESSION["loggedIn"])){
            return ['success' => true];			
        } else {
            return ['success' => false];
        }
    }
}

function submitFish($game_id, $playerFish){
    $gameStats = gameStats();
    if($gameStats['maxplayer']*10 >= $playerFish && $gameStats['fishInSea'] >= $playerFish){
        $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
        $stmt = $mysqli->prepare("SELECT id FROM round WHERE game_id = ? AND roundNr = ?"); 
        $stmt->bind_param("ii", $game_id, $gameStats['currentRound']);
        $stmt->bind_result($round_id);
        $stmt->execute();
        $result = $stmt->fetch();
        $stmt->close();
        $stmt = $mysqli->prepare("INSERT INTO turn (round_id, fish_wanted, team_id) VALUES(?, ?, ?)");
        $stmt->bind_param("iii",$round_id, $playerFish, $team_id);
        $stmt->execute();   
        $stmt->close();
        $mysqli->close();
    }else{
        return ['success' => false];
    }         
}

function createGame(){
    $gameCode = generatecode();
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("INSERT INTO game (gameCode) VALUES(?)"); 
    $stmt->bind_param("si",$gameCode);
    $stmt->execute();
    $stmt->close();
    $stmt = $mysqli->prepare("SELECT id FROM game WHERE game_id = ?"); 
    $stmt->bind_param("i",$game_id);
    $stmt->bind_result($id);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close(); 
    return(['id' => $id ,'gameCode' => $gameCode]); 
}

function generateGameCode(){
    $codeExists = true;
    while($codeExsists) {
        $lenght = 5;
        $gameCode = ""; 
        $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $max = strlen($characters);
        for ($i = 0; $i < $max; $i++) {
            $gameCode .= $characters[mt_rand(0, $max)];
        }
        $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
        $stmt = $mysqli->prepare("SELECT gameCode FROM game WHERE gameCode = ?"); 
        $stmt->bind_param("i", $gameCode);
        $stmt->bind_result($gameCodeDB);
        $stmt->execute();
        $result = $stmt->fetch();
        $stmt->close();
        if(empty($gameCodeDB)){
            $codeExists  = false;
        }
    }
    return (['gameCode' => $gameCode]);
}

function startGame($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT COUNT(name) FROM team WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($maxPlayers);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("UPDATE game SET gameStarted = '1', players = ?  WHERE id = ?"); 
    $stmt->bind_param("ii",$maxPlayers, $game_id);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("INSERT INTO round (game_id, roundNr, fish_start) VALUES(?, 1, ?)"); 
    $stmt->bind_param("sii", $gameCode,$fish_start);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
}

function getPlayers($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT name FROM team WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($name);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return (['name' => $name]);          
}

function gameStarted($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT gameStarted FROM game WHERE id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($gameStarted);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return (['gameStarted' => $gameStarted]);         
}

function playersReady($game_id){
    $stmt = $mysqli->prepare("SELECT currentRound FROM game WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($currentRound);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("SELECT id FROM round WHERE game_id = ? AND roundNr = ? "); 
    $stmt->bind_param("ii",$game_id, $currentRound);
    $stmt->bind_result($round_id);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM turn WHERE round_id = ?;"); 
    $stmt->bind_param("i", $round_id);
    $stmt->bind_result($playersReady);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return (['playersReady' => $playersReady]); 
}

function gameStats($game_id){
    if(isset($_GET["game_id"])) {
        $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
        $stmt = $mysqli->prepare("SELECT currentRound, players FROM game WHERE id = ?"); 
        $stmt->bind_param("i", $game_id);
        $stmt->bind_result($currentRound, $maxPlayers);
        $stmt->execute();
        $result = $stmt->fetch();
        $stmt->close();
        $stmt = $mysqli->prepare("SELECT fish_start FROM round WHERE game_id = ? AND roundNr =?;");
        $stmt->bind_param("ii", $game_id, $currentRound); 
        $stmt->bind_result($fishInSea);
        $stmt->execute();
        $result = $stmt->fetch();
        $stmt->close();
        $mysqli->close();
        return (["maxPlayers" => $maxPlayers, "currentRound" => $currentRound,"fishInSea" => $fishInSea]);     
    }
}

function joinGame($gameCode, $teamName) {   
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]);
    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
    }
    $gameCode = $mysqli->real_escape_string($gameCode);
    if ($result = $mysqli->query("SELECT id FROM game WHERE gameCode = '$gameCode'")) {
        $obj = $result->fetch_object();
        $result->close();
        if(gameStarted($obj->id)) {
            $mysqli->close();
            return ['success' => false];
        }
    } else {
        $teamName = $mysqli->real_escape_string($teamName);
        $mysqli->query("INSERT into team (game_id, name) VALUES ('$obj->id', '$teamName')");
        $mysqli->close();
        return ['gameId' => $gameId];
    } 
}

function roundOver($game_id) {
    $gameStats = gameStats($game_id);
    $turns = [];
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT id, team_id, fish_wanted FROM turn WHERE round_id = (SELECT id FROM round WHERE game_id = '?' AND roundNr = ?)"); 
    $stmt->bind_param("ii", $game_id, $gameStats['currentRound']);
    $stmt->bind_result($turn_id, $team_id, $fish_wanted);
    $stmt->execute();
    while($stmt->fetch()) {
        $turns[] = ["turn_id" => $turn_id, "team_id" => $team_id,"fish_wanted" => $fish_wanted];
    }
    $stmt->close();
    $mysqli->close();
    shuffle($turns);
    for ($i = 0; $i < count($turns); $i++) {
        $fishCaught = 0;
        if($fish_wanted < $gameStats['fishInSea']){
            $fishCaught = $fish_wanted;
            $gameStats['fishInSea'] = $gameStats['fishInSea']-$fish_wanted ;
        }else{
            $fishCaught=$gameStats['fishInSea'];
            $gameStats['fishInSea'] = 0;
        }
    $stmt = $mysqli->prepare("UPDATE turn SET fish_caught = ? WHERE id = ?");
    $stmt->bind_param("ii",$fishCaught,$team_id );
    $stmt->execute();
    $stmt->close();
    }
    $stmt = $mysqli->prepare("UPDATE round SET fish_end = ? WHERE id = ?");
    $stmt->bind_param("ii",$gameStats['currentRound'],$game_id );
    $stmt->execute();
    $stmt->close();
    $gameStats['currentRound']+=1;
    $maxFish = $gameStats['maxPlayers']*10;
    $gameStats['fishInSea'] = $gameStats['fishInSea'] * 2;
    if($gameStats['fishInSea'] > $maxFish){
        $gameStats['fishInSea'] = $maxFish; 
    }
    $stmt = $mysqli->prepare("INSERT INTO round (game_id, roundNr, fish_start) VALUES(?, ?, ?)");
    $stmt->bind_param("iii",$game_id,$gameStats['currentRound'],$gameStats['fishInSea']);
    $stmt->execute();
    $stmt->close();
    $stmt = $mysqli->prepare("UPDATE game SET currentRound = ? WHERE id = ?");
    $stmt->bind_param("ii",$gameStats['currentRound'],$game_id);
    $stmt->execute();
    $stmt->close();
}
?>
