<?php
ob_end_clean();
if(isset($_POST["image"])&&isset($_POST["workerid"])&&isset($_POST["imgInd"])&&isset($_POST["index"])&&isset($_POST["length"])){
       $img = $_POST['image']; // Your data 'data:image/png;base64,AAAFBfj42Pj4';
       $id = $_POST['workerid']; 
       $imgInd = $_POST['imgInd'];
       $index = $_POST['index']; 
       $length = $_POST['length'];
# save imgs in each workerID file
       $img = str_replace('data:image/png;base64,', '', $img);
       $img = str_replace(' ', '+', $img);  
       $data = base64_decode($img);

       $temp_file = "/var/www/segmentation/".$id;
       if(file_exists($temp_file)){}
       else{
       	  mkdir($temp_file);	
       }
       $sucIMG = file_put_contents($temp_file."/".$imgInd.".png", $data);

       header("Content-Type: text/csv");
       header("Content-Disposition: attachment");
       header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1
       header("Pragma: no-cache"); // HTTP 1.0
       header("Expires: 0"); // Proxies

       if(($length-1)==$index){
	        $token = getToken(20);
	        $sucCSV = outputCSV($id, $token);
       }else{ 
       	 $token = 0; 
       	 $sucCSV = 1;
       }

       $result = array("img" => $sucIMG, "csv" => $sucCSV, "token" => $token);
       echo json_encode($result);

}
else{
	echo "para not set";
}

function outputCSV($id, $token) {
    $output = fopen("/var/www/segmentation/surveycode.csv", "a");
    $success = fputcsv($output, array($id, $token)); // here you can change delimiter/enclosure
    fclose($output);
    return $success;
}

function crypto_rand_secure($min, $max) {
            $range = $max - $min;
            if ($range < 0) return $min; // not so random...
            $log = log($range, 2);
            $bytes = (int) ($log / 8) + 1; // length in bytes
            $bits = (int) $log + 1; // length in bits
            $filter = (int) (1 << $bits) - 1; // set all lower bits to 1
            do {
               $rnd = hexdec(bin2hex(openssl_random_pseudo_bytes($bytes)));
               $rnd = $rnd & $filter; // discard irrelevant bits
            } while ($rnd >= $range);
            return $min + $rnd;
}

function getToken($length){
            $token = "";
            $codeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            $codeAlphabet.= "abcdefghijklmnopqrstuvwxyz";
            $codeAlphabet.= "0123456789";
            for($i=0;$i<$length;$i++){
                        $token .= $codeAlphabet[crypto_rand_secure(0,strlen($codeAlphabet))];
            }
            return $token;
}
?>
