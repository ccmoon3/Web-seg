<?php
if(!empty($_POST["mid"])&&!empty($_POST["record"])){

   	  $id = $_POST['mid'];
   	  $record = $_POST["record"];
   	  $temp_file = "/var/www/segmentation/".$id;
   	  
   	  if(file_exists($temp_file)){}
      else{
       	  mkdir($temp_file);	
      }

      $myfile = fopen($temp_file."/".$id.".txt", "a") or die("Unable to open file!");
      $success = fwrite($myfile, json_encode($record)) or die("Write to txt on server failed");
      echo $success;
      fclose($myfile);
}
?>