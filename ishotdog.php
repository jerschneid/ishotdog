<?php
    function cors() {
        
        // Allow from any origin
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
            // you want to allow, and if so:
            header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');    // cache for 1 day
        }
        
        // Access-Control headers are received during OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                // may also be using PUT, PATCH, HEAD etc
                header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
            
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        
            exit(0);
        }
    }    

    function GetAccessTokenFileName()
    {
        return "access-token.txt";
    } 
    
    function SaveAccessToken($token)
    {  
        file_put_contents(GetAccessTokenFileName(), json_encode($token));
    }

    function GetSavedAccessToken()
    {
        $token = null;

        try
        {
            $token = json_decode(file_get_contents(GetAccessTokenFileName()));
        }
        catch (Exception $e) 
        {}

        return $token;
    }

    function GetAccessToken()
    {
        //error_log("GetAccessToken");

        $savedToken = GetSavedAccessToken();
        $oktime = strtotime(date('Y-m-d H:i:s')) - 30;

        if($savedToken != null && strtotime($savedToken->{'date'}) > $oktime)
        {
            //error_log("USING SAVED TOKEN: " . $savedToken->{'token'});
            return $savedToken->{'token'};
        } 

        $url = 'https://www.nyckel.com/connect/token';

        $ch = curl_init( $url );

        $clientID = "ca4pl9vdggyztnygmkvdtoy9uzo0eguu";
        $clientSecret = "s0ivrqile544i04gyjsjzscncvulkuzzm37t43pw29zokurtv82uobv0nvjwvx0j";

        //$data = array('client_id' => $clientID, 'client_secret', $clientSecret, 'grant_type' => 'client_credentials');
        $data = "client_id=ca4pl9vdggyztnygmkvdtoy9uzo0eguu&client_secret=s0ivrqile544i04gyjsjzscncvulkuzzm37t43pw29zokurtv82uobv0nvjwvx0j&grant_type=client_credentials";

        $headr = array();
        $headr[] = 'Content-type: application/x-www-form-urlencoded';
        curl_setopt( $ch, CURLOPT_HTTPHEADER, $headr);        
        curl_setopt($ch, CURLOPT_POST,1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec( $ch );

        $json = json_decode($response);

        //error_log(curl_getinfo($ch));
        //error_log('Response: ' . $response);        
        //error_log($json);


        $token = array('token' => $json->{'access_token'}, 'date' => date('Y-m-d H:i:s'));
        SaveAccessToken($token);

        //error_log("GOT NEW TOKEN: " . $token["token"]);

        return $token["token"];
    }

    if(session_id() == ''){ session_start();}
    cors();

    // error_log( "IsHotDog!", TRUE );
    // error_log( "SessionID: " . session_id(), TRUE );

    //error_log($_FILES);

    $url = 'https://www.nyckel.com/v0.9/functions/km6svjpscep917bc/invoke';


    $filePath = $_FILES['file']['tmp_name'];
    $data = array('data' => $filePath);
    // error_log( $data );

    $ch = curl_init( $url );

    $accesstoken = GetAccessToken();
    $headr = array();
    $headr[] = 'Authorization: Bearer '. $accesstoken;
    $headr[] = 'Content-type: multipart/form-data';
    curl_setopt( $ch, CURLOPT_HTTPHEADER, $headr);


    $cfile = curl_file_create($filePath,'image/jpeg','data');
    $data = array('data' => $cfile);
    curl_setopt($ch, CURLOPT_POST,1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 

    //Comment this out unless testing
    //curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  

    $response = curl_exec( $ch );

    if(curl_errno($ch))
    {
        error_log('Curl error: ' . curl_error($ch));
    }    
    
    $info = curl_getinfo($ch);
    // error_log($info['request_header']);
    // error_log($response);
    // error_log('Response: ' . $response);

//    curl_close( $ch );
?>