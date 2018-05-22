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
    case "gameStats":
        if(isset($_GET["game_id"])) {
            echo json_encode(gamestats($_GET["game_id"]));
        }
    case "playersReady":
    if(isset($_GET["game_id"])) {
        echo playersReady($_GET["round_id"]);
    }
    case "getPlayers":
        if(isset($_GET["game_id"])) {
            echo gerPlayers($_GET["game_id"]);
        }
    
    case "login":
        if(isset($_POST["submit"])) {

            $success = loginUser($_POST['username'], $_POST['password']);
            if($success) {
				$messages[] = ["Logged in"];
			} else {
				
				$messages[] = ["error","Wrong username and password combination"];
			}
                //kontrollib username ja parooli õigsust.
            // return(1,0)
        }
    
    case "startGame":
        if (isset($_SESSION["loggedIn"])){
            if(isset($_POST["submit"])) {
                if(is_numeric($_GET["game_id"])){
                    echo startGame($_GET["game_id"]);
                }
            }
        }

    case "createGame":
    if (isset($_SESSION["loggedIn"])){
        if(isset($_POST["submit"])) {
            echo createGame();
        }
    }
	    
    case "submitFish":
        if(isset($_POST["submit"])) {
            echo gameStats($game_id);
            echo submitFish();
        }   
        
    case "roundOver":
        if(isset($_POST["submit"])) {
            echo gameStats($game_id);
            /*võtab suvalises järjekorras playerid turn tabelist, kus round = currentRound ja game_id ka. iga playeri kohta vaatab palju kalu tahab, lahutab selle max kaladest mis saab game statsist(aga eraldi muutujas $fishInSea)
            pärast kalade ära jagamist, muutab current roundi +1, ja lisab kalu vette vastavalt ($fishInSea = $fishInSea * 2, if($fishInSea > maxFish) siis $fishInSea = maxFish); samuti updatib vana roundi "fish_end'i"
            teeb uue roundi kirje insert into round(game_id, roundNr, fish_start) values($game_id, 1, 5*playersCount*2)*/
            break;
        }

    case "joinGame":
        if(isset($_POST["gameCode"]) && isset($_POST["teamName"])) {
            echo json_encode(joinGame($_POST["gameCode"], $_POST["teamName"]));
            /*võtab suvalises järjekorras playerid turn tabelist, kus round = currentRound ja game_id ka. iga playeri kohta vaatab palju kalu tahab, lahutab selle max kaladest mis saab game statsist(aga eraldi muutujas $fishInSea)
            pärast kalade ära jagamist, muutab current roundi +1, ja lisab kalu vette vastavalt ($fishInSea = $fishInSea * 2, if($fishInSea > maxFish) siis $fishInSea = maxFish); samuti updatib vana roundi "fish_end'i"
            teeb uue roundi kirje insert into round(game_id, roundNr, fish_start) values($game_id, 1, 5*playersCount*2)*/
            break;
        }

}

function submitFish(){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT id FROM round WHERE game_id = ? AND roundNr = ?"); 
    $stmt->bind_param("ii",$game_id, $currentRound);
    $stmt->execute();
    $stmt->bind_result($id);
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("INSERT INTO turn (round_id, fish_wanted, team_id) VALUES(?, ?, ?)");
    $stmt->bind_param("iii",$round_id, $playerFish, $team_id);
    $stmt->execute();   
    $stmt->close();
    $mysqli->close();         
}

function createGame(){
    $gameCode = generatecode();
    
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("INSERT INTO game (gameCode , currentRound) VALUES(?,?)"); 
    $stmt->bind_param("si",$gameCode, $currentround);
    $stmt->execute();
    $stmt->close();
    $stmt = $mysqli->prepare("SELECT id FROM game WHERE game_id = ?"); 
    $stmt->bind_param("i",$game_id);
    $stmt->bind_result($id);
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close(); 
    return([$id , $gameCode]); 
               
}

function generateGameCode(){
    $codeExists = false;
    while(!$codeExsists) {
        
        $lenght = 5;
        $gameCode = ""; 
        $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $max = strlen($characters) - 1;
        for ($i = 0; $i <= $max; $i++) {
            $gameCode .= $characters[mt_rand(0, $max)];
        }
        $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
        $stmt = $mysqli->prepare("SELECT gameCode FROM game WHERE gameCode = ?"); 
        $stmt->bind_param("i", $gameCode);
        $stmt->execute();
        $stmt->bind_result($gameCodeDB);
        $result = $stmt->fetch();
        $stmt->close();
        if(empty($gameCodeDB)){
            $codeExists  = true;
            return $gameCode;
        }else{
            return "game already exists";
        }
    }
}
function startGame($game_id){
    
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT COUNT(name) FROM team WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $stmt->bind_result($maxPlayers);
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("UPDATE game SET gameStarted = '1' WHERE id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("UPDATE game SET players = ? WHERE id = ?");
    $stmt->bind_param("ii",$maxPlayers, $game_id);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("INSERT INTO round (game_id, roundNr, fish_start) VALUES(?, ?, ?)"); 
    $stmt->bind_param("sii", $gameCode,$roundNr,$fish_start);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
}

function getPlayers($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT name FROM team WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $stmt->bind_result($name);
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return $name;            
}

function gameStarted($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT gameStarted FROM game WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $stmt->bind_result($gameStarted);
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return $gameStarted;         
}

function playersReady(){
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM turn WHERE round_id = ?;"); 
    $stmt->bind_param("i", $round_id);
    $stmt->execute();
    $stmt->bind_result($playersReady);
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return $playersReady;
}

function gameStats($game_id){
    if(isset($_GET["game_id"])) {
        $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
        $stmt = $mysqli->prepare("SELECT currentRound FROM game WHERE game_id = ?"); 
        $stmt->bind_param("i", $game_id);
        $stmt->execute();
        $stmt->bind_result($currentRound);
        $result = $stmt->fetch();
        $stmt->close();
        $stmt = $mysqli->prepare("SELECT id FROM round WHERE game_id = ? AND turn_id =?;");
        $stmt->bind_param("ii", $game_id, $currentRound); 
        $stmt->execute();
        $stmt->bind_result($round_id);
        $result = $stmt->fetch();
        $stmt->close();
        $stmt = $mysqli->prepare("SELECT COUNT(players) FROM game WHERE id = ?;"); 
        $stmt->bind_param("i", $game_id);
        $stmt->execute();
        $stmt->bind_result($maxPlayers);
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
    }

    if(gameStarted($obj->id)) {
        $mysqli->close();
        return 0;
    } else {
        $teamName = $mysqli->real_escape_string($teamName);
        $mysqli->query("INSERT into team (game_id, name) VALUES ('$obj->id', '$teamName')");
        $mysqli->close();
        return 1;
    } 
}
?>
