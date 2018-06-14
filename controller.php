<?php

require "config.php";

$action = "post_list";	
if(isset($_GET['action']) && $_GET['action']) {
	$action = $_GET['action'];
}

session_start();

switch($action) {
    case "gameStarted" : 
        if(isset($_POST["game_id"]) && is_numeric($_POST["game_id"])) {
            echo json_encode(gameStarted($_POST["game_id"]));
        }
        break;

    case "gameStats":
        if(isset($_POST["game_id"]) && is_numeric($_POST["game_id"])) {
            echo json_encode(gamestats($_POST["game_id"]));
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    case "playersReady":
        if(isset($_POST["game_id"]) && is_numeric($_POST["game_id"])) {
            echo json_encode(playersReady($_POST["game_id"]));
        }
        break;

    case "getPlayers":
        if(isset($_POST["game_id"])) {
            echo json_encode(getPlayers($_POST["game_id"]));
        } else {
            echo json_encode(["success" => false]);
        }
        break;
    /*case "register":
        $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]);
        $username = 'Pisimudilake';
        $password = hash("sha512", 'p66rinootKala');
        $stmt = $mysqli->prepare("INSERT INTO users (username, password) VALUES(?, ?)");
        $stmt->bind_param("ss",$username,$password);
        $stmt->execute();   
        $stmt->close();
        $mysqli->close();
        break;*/
    case "login":
        if(isset($_POST["username"]) && isset($_POST['password'])) {
            echo json_encode(login($_POST['username'], $_POST['password']));
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    case "startGame":
        if (isset($_SESSION["loggedIn"])) {
            if(isset($_POST["game_id"]) && is_numeric($_POST["game_id"])) {
                echo json_encode(startGame($_POST["game_id"]));
            } else {
                echo json_encode(["success" => false]);
            }
        } else {
            echo json_encode(["success" => false]);
        }
        break;
        
    case "createGame":
        if (isset($_SESSION["loggedIn"])){     
            echo json_encode(createGame());
        } else {
            echo json_encode(["success" => false]);
        }
        break;
        
    case "submitFish":
        if(isset($_POST['game_id']) && isset($_POST['playerFish']) && isset($_POST['team_id']) && is_numeric($_POST['game_id']) && is_numeric($_POST['playerFish']) && is_numeric($_POST['team_id']) && (filter_var($_POST['playerFish'], FILTER_VALIDATE_INT) || $_POST['playerFish'] === '0')) {
            //echo json_encode(gameStats($game_id));
            echo json_encode(submitFish($_POST["game_id"], $_POST['playerFish'], $_POST['team_id']));
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    case "roundOver":
        if(isset($_POST['game_id']) && is_numeric($_POST['game_id'])) { 
            echo json_encode(roundOver($_POST['game_id'])); 
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    case "joinGame":
        if(isset($_POST["gameCode"]) && isset($_POST["teamName"])) {
            echo json_encode(joinGame(strtolower($_POST["gameCode"]), $_POST["teamName"]));
            // echo json_encode(['gameId' => 13, 'teamId' => 1]);
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    case "isLoggedIn":
        $response = array();
        if(isset($_SESSION["loggedIn"])) {
            $response['loggedIn'] = true;
        } else {
            $response['loggedIn'] = false;
        }
        echo json_encode($response);
        break;

    case "logOut":
        session_unset();
        echo json_encode(["success" => true]);
        break;
    case "playerFish":
        if(isset($_POST["team_id"]) && is_numeric($_POST['team_id'])) {
            echo json_encode(playerFish($_POST["team_id"]));
        }
        break;
    case "endGame":
        if(isset($_POST['game_id']) && is_numeric($_POST['game_id'])) { 
            echo endGame($_POST['game_id']); 
        }
        break;
    default:
        echo  "Invalid action";
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
            $_SESSION["loggedIn"] = true;
        }
	}
    $stmt->close();
    $mysqli->close();
   // $_SESSION["loggedIn"] = true; //kuna kasutajat pole veel debug reasons
   // return ["success" => true];	//kuna kasutajat pole veel debug reasons
    if(isset ($_SESSION["loggedIn"])){
            return ['success' => true];			
        } else {
            return ['success' => false];
        }
}

function submitFish($game_id, $playerFish, $team_id){
    $gameStats = gameStats($game_id);
    if($gameStats["maxPlayers"]*10 >= $playerFish && $gameStats['fishInSea'] >= $playerFish){
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
        return ['success' => true];
    }else{
        return ['success' => false];
    }         
}

function createGame(){
    $dateNow = new DateTime();
    $dateNow->modify('-1 day');
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT id, created FROM game"); 
    $stmt->bind_result($id, $created);
    $stmt->execute();
    while ($stmt->fetch()){
        $dateDB = new DateTime($created);
        if($dateNow > $dateDB) {
            $mysqli2 = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
            $stmt2 = $mysqli2->prepare("DELETE FROM turn WHERE round_id IN (SELECT id FROM round WHERE game_id = ?)");
            $stmt2->bind_param("i", $id);
            $stmt2->execute();
            $stmt2->close();
            $stmt2 = $mysqli2->prepare("DELETE FROM round WHERE game_id = ?");
            $stmt2->bind_param("i", $id);
            $stmt2->execute();
            $stmt2->close();
            $stmt2 = $mysqli2->prepare("DELETE FROM team WHERE game_id = ?");
            $stmt2->bind_param("i", $id);
            $stmt2->execute();
            $stmt2->close();
            $stmt2 = $mysqli2->prepare("DELETE FROM game WHERE id = ?");
            $stmt2->bind_param("i", $id);
            $stmt2->execute();
            $stmt2->close();
            $mysqli2->close();
        }
    }    
    $stmt->close();
    $gameCode = generateGameCode();
    $stmt = $mysqli->prepare("INSERT INTO game (gameCode, gameStarted) VALUES(?, 0)"); 
    $stmt->bind_param("s",$gameCode);
    $stmt->execute();
    $game_id = $stmt->insert_id;
    $stmt->close();
    $mysqli->close(); 
    return(['id' => $game_id ,'gameCode' => $gameCode]); 
}

function generateGameCode(){
    $codeLenght = 4;
    $characters = 'abdefghjklmpqrsvwxyz2345678923456789';
    $charArrayLength = strlen($characters)-1;
    $codesArray = [];

    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT gameCode FROM game where gameStarted = 0"); 
    $stmt->bind_result($codeDB);
    $stmt->execute();
    while ($stmt->fetch()){
        $codesArray[] = $codeDB;
    }
    $stmt->close();
    do {
        $gameCode = ""; 
        for ($i = 0; $i < $codeLenght; $i++) {
            $gameCode .= $characters[mt_rand(0, $charArrayLength)];
        }
    } while(in_array($gameCode, $codesArray)); 
    return $gameCode;
}

function startGame($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT COUNT(name) FROM team WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($maxPlayers);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("UPDATE game SET currentRound = '1', gameStarted = '1', players = ?  WHERE id = ?"); 
    $stmt->bind_param("ii",$maxPlayers, $game_id);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $fish = $maxPlayers * 10;
    $stmt = $mysqli->prepare("INSERT INTO round (game_id, roundNr, fish_start) VALUES(?, 1, ?)"); 
    $stmt->bind_param("ii", $game_id, $fish);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return (["success" => true, "maxPlayers" => $maxPlayers]);
}

function getPlayers($game_id){
    $names = [];
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT name FROM team WHERE game_id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($name);
    $stmt->execute();
    while ($stmt->fetch()){
        $names[] = $name;
    }
    $stmt->close();
    $mysqli->close();
    if(empty($names)){
        return (['none' => "true"]);
    }
    return (['names' => $names]);          
}

function gameStarted($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT gameStarted FROM game WHERE id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($gameStarted);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return (['gameStarted' => $gameStarted]);         
}

function playersReady($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT currentRound FROM game WHERE id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($currentRound);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();
    $stmt = $mysqli->prepare("SELECT COUNT(*) FROM turn WHERE round_id = (SELECT id FROM round WHERE game_id = ? AND roundNr = ?)"); 
    $stmt->bind_param("ii",$game_id, $currentRound);
    $stmt->bind_result($playersReady);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return (['playersReady' => $playersReady]); 
}

function gameStats($game_id){
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT currentRound, players FROM game WHERE id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($currentRound, $maxPlayers);
    $stmt->execute();
    $stmt->fetch();
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

function joinGame($gameCode, $teamName) {   
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT id FROM game WHERE gameCode = ? and gameStarted = 0"); 
    $stmt->bind_param("s", $gameCode);
    $stmt->bind_result($gameId);
    $stmt->execute();
    $result = $stmt->fetch();
    $stmt->close();
    if(!$gameId) {
        //var_dump($gameId ); die;
        $mysqli->close();
        return ['success' => false];
    } else {
        // if(name on õigetest char-idest ja 15 märki pikk)
        $stmt = $mysqli->prepare("INSERT into team (`game_id`, `name`) VALUES (?, ?)"); 
        //var_dump($gameId, $teamName); die;
        $stmt->bind_param("is", $gameId, $teamName);
        $stmt->execute();
        $teamId = $stmt->insert_id;
        $stmt->close();
        $mysqli->close();
        return ['gameId' => $gameId, 'teamId' => $teamId];
    }
}

function roundOver($game_id) {
    $gameStats = gameStats($game_id);
    $turns = [];
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT id, team_id, fish_wanted FROM turn WHERE round_id = (SELECT id FROM `round` WHERE game_id = ? AND roundNr = ?)"); 
    $stmt->bind_param("ii", $game_id, $gameStats['currentRound']);
    $stmt->bind_result($turn_id, $team_id, $fish_wanted);
    $stmt->execute();
    while($stmt->fetch()) {
        $turns[] = ["turn_id" => $turn_id, "team_id" => $team_id,"fish_wanted" => $fish_wanted];
    }
    $stmt->close();
    shuffle($turns);
    for ($i = 0; $i < count($turns); $i++) {
        $fishCaught = 0;
        if($turns[$i]['fish_wanted'] < $gameStats['fishInSea']){
            $fishCaught = $turns[$i]['fish_wanted'];
            $gameStats['fishInSea'] = $gameStats['fishInSea'] - $turns[$i]['fish_wanted'];
        }else{
            $fishCaught = $gameStats['fishInSea'];
            $gameStats['fishInSea'] = 0;
        }
    $stmt = $mysqli->prepare("UPDATE turn SET fish_caught = ? WHERE id = ?");
    $stmt->bind_param("ii",$fishCaught, $turns[$i]['turn_id']);
    $stmt->execute();
    $stmt->close();
    }

    $stmt = $mysqli->prepare("UPDATE `round` SET fish_end = ? WHERE game_id = ? AND roundNr = ?");
    $stmt->bind_param("iii",$gameStats['fishInSea'], $game_id, $gameStats['currentRound'] );
    $stmt->execute();
    $stmt->close();
    $gameStats['currentRound'] += 1;
    $maxFish = $gameStats['maxPlayers'] * 10;
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
    $mysqli->close();
    return ['success' => true];
}

function playerFish($team_id) {
    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT game_id FROM team WHERE id = ?"); 
    $stmt->bind_param("i", $team_id);
    $stmt->bind_result($gameId);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();
    $gameStats = gameStats($gameId);
    $totalFish = 0;
    $lastFish = 0;
    $stmt = $mysqli->prepare("SELECT fish_caught FROM turn WHERE team_id = ? AND round_id IN (SELECT id FROM `round` WHERE game_id = ?)"); 
    $stmt->bind_param("ii", $team_id, $gameId);
    $stmt->bind_result($fish);
    $stmt->execute();
    while($stmt->fetch()) {
        $totalFish += $fish;
    }
    $lastFish = $fish;
    $stmt->close();
    $mysqli->close();
    return (["totalFish" => $totalFish, "lastFish" => $lastFish]);
}

function endGame($game_id) {
    $overallStats = (object)[];

    $mysqli = new mysqli($GLOBALS["serverHost"], $GLOBALS["serverUsername"], $GLOBALS["serverPassword"], $GLOBALS["database"]); 
    $stmt = $mysqli->prepare("SELECT currentRound-1 FROM game WHERE id = ?"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($overallStats->roundsPlayed);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();
    
    $stmt = $mysqli->prepare("SELECT sum(fish_caught), avg(fish_caught), min(fish_wanted), max(fish_wanted) FROM turn WHERE round_id IN (SELECT id FROM `round` where game_id = ?)"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($overallStats->fishSum, $overallStats->fishAvg, $overallStats->fishMin, $overallStats->fishMax);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();
    $overallStats->fishAvg = round($overallStats->fishAvg,2);
    $overallStats->fishSum = (int)$overallStats->fishSum;

    $stmt = $mysqli->prepare("SELECT count(fish_caught) FROM turn WHERE fish_caught > 8 AND round_id IN (SELECT id FROM `round` where game_id = ?)"); 
    $stmt->bind_param("i", $game_id);
    $stmt->bind_result($overallStats->fishRobbery);
    $stmt->execute();
    $stmt->fetch();
    $stmt->close();

    /*
    $teams = (object)[];

    for ($i = 1; $i <= $overallStats['roundsPlayed']; $i++) {
        $stmt = $mysqli->prepare("SELECT te.name, t.fish_caught FROM team te INNER JOIN turn t ON te.id = t.team_id WHERE t.round_id IN (SELECT id FROM round where game_id = ?) ORDER BY te.name ASC"); 
        $stmt->bind_param("ii", $game_id, $i);
        $stmt->bind_result($name, $order, $wanted, $caught);
        $stmt->execute();
        $k = 0;
        while($stmt->fetch()) {
            $totals[$k] += $caught;
            $k++;
            $teams[$k] = ["name" => $name, "order" => $order,"wanted" => $wanted, "caught" => $caught, "total" => $totals[$k]];
        }
        $rounds[$i-1] = $teams[$k];
        $stmt->close();
    }
    return (["overallStats" => $overallStats, "rounds" => $rounds]);

    /*
        tiimide edetabe:
            *iga tiimi nimi ja kalade arv*

        Üldstatistika:
            *rounde mängitud
            *kokku kalu püütud
            *Keskmiselt roundis kalu püütud
            *väikseim kogus kalu püütud
            *röövpüükide arv
            *suurim kogus kalu püütud

            a = SELECT currentRound-1 FROM game WHERE id = ?
            SELECT sum(fish_caught), avg(fish_caught), min(fish_caught), max(fish_caught)  FROM turn WHERE round_id IN (SELECT id FROM round where game_id = ?)
            SELECT count(fish_caught) FROM turn WHERE fish_caught > 8 AND round_id IN (SELECT id FROM round where game_id = ?)


        iga roundi tabel (üks rida enne tabelit on voor: number )
            columns: tiim, järjekord, soovitud kalu, saadud kalu, (kalu total)

            SELECT team_id FROM turn WHERE round_id = (SELECT id FROM round where roundNr = 1 AND game_id = ?)
            for a:
                for each team_id:
                    SELECT te.name, t.queue, t.fish_wanted, t.fish_caught FROM team te INNER JOIN turn t ON te.id = t.team_id WHERE t.round_id = (SELECT id FROM round where game_id = ? AND roundNr = a)
    */
    return json_encode(['overallStats' => $overallStats, 'test' => false]);
}
?>
