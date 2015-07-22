<script type="text/javascript">
//test_o: original image
//test_b: only with border
//test_l: border && part labels
//test_s: only with all Subsegment border

    window.onload = function(){
         //modeIndex: 0=split, 1=merge, 2=label
         window.labelColor, window.modeIndex;
         window.pushArray, window.step;
         window.mergeArray;

         window.context, window.bor_canvas;
         window.label_imgData, window.Subseg_imgData, window.ori_imgData, window.border_imgData;


         var labels =[
                  {  id:'label-sky', name: 'Sky', color: [0, 0, 225]},
                  {  id:'label-cloud', name: 'Cloud', color: [210, 0, 0]},
                  {  id:'label-clearlabel', name: 'Clear label', color: [255, 255, 255]},
                ];
         initializeMode(labels);
         //random select 2 images for each users from total 3 images.
         var imageIndex = randomIndex(2, 3);
         var mid = getParameterByName("MID");

         window.sesst = setInterval(function(){
            retrieveSessionStorage(mid);
         },10000);

         initializeImages(imageIndex[0], function(width, height){
            initializeContainListener(width, height);
            initializeButtons(imageIndex, 0, mid);
         });

    }

    function retrieveSessionStorage (mid) {
        var dataForServer = [];
        var len =  window.sessionStorage.length;
        if(len>0){
           for(var i = 0; i < len; i++){
             dataForServer.push(window.sessionStorage.getItem(window.sessionStorage.key(0)));
             window.sessionStorage.removeItem(window.sessionStorage.key(0));
           }
           console.log(dataForServer);
           sendStorageToServer(dataForServer, mid, 0);
        }
    };

    function sendStorageToServer(rec, mid, count){

             $.ajax({
                type: "POST",
                url: "./record.php",
                data: {
                  'mid': mid,
                  'record': rec,
                },
                success: function(e){
                   console.log("record success:"+e);
                },
                error: function(e) {
                    if(count<5){
                      sendStorageToServer(rec, mid, ++count);
                    }
                    else{
                       console.log('record-Error after 5 times try');
                       console.log(e);
                    }
                 }
              });
    }


    function randomIndex(n, total){
        var arr = [];
        while(arr.length < n){
           var randomNumber = Math.floor(Math.random()*total);
           var found = false;
           for(var i=0;i<arr.length;i++){
              if(arr[i]==randomNumber){
                found = true;
                break}
           }
          if(!found)
            arr.push(randomNumber);
        }
        return arr;
    }

    function initializeImages( i, callback){
         var img = new Image();
         document.getElementById('undo-button').disabled = true;
         document.getElementById('redo-button').disabled = true;
         document.getElementById('next-button').disabled = true;

         pushArray = new Array(), step = -1;
         mergeArray = new Array();

         img.onload = function() {
                var canvas = document.getElementById('label');
                canvas.width = img.width;
                canvas.height = img.height;
                context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                label_imgData = context.getImageData(0, 0, img.width, img.height);
                context.putImageData(label_imgData,0,0);

                loadImage( i+'/'+'test_s.png',function(imgData, canvas){
                  Subseg_imgData = imgData;
                });
                loadImage( i+'/'+'test_o.png',function(imgData, canvas){
                  ori_imgData = imgData;
                });
                loadImage( i+'/'+'test_b.png',function(imgData, canvas){
                  border_imgData = imgData;
                  bor_canvas = canvas;
                  store();
                });
                callback(img.width, img.height);
         }
         img.src =  i+'/'+'test_l.png';
      }

      function localStore(time, domID, op){
      /*      var info = { t:new Date().getTime(), act:domID, opt:op};
            var userid =getParameterByName('MID');
            console.log("MID:"+userid);
            var data = [];

            if (window.sessionStorage.getItem(userid)!==null && window.sessionStorage.getItem(userid)!==undefined) {
               data = JSON.parse(sessionStorage.getItem(userid));
            }
            data.push(info);
            window.sessionStorage.setItem(userid, JSON.stringify(data));*/
            var info = {t:time, act:domID, opt:op};
            try{
               window.sessionStorage.setItem(time, JSON.stringify(info));
            }catch(e){
               console.log(e);
            }
      }

      //0:split, 1:merge, 2:blue, 3:cloud, 4:clear
      function initializeMode(labels){
         function attachClickEvent(item, i) {
            item.addEventListener('click', function() {
               var selected = document.getElementsByClassName('item-selected')[0];
               if (selected){
                 selected.classList.remove('item-selected');
               }
               this.classList.add('item-selected');
               localStore(new Date().getTime(), this.id,"select");

               if(i>=1){
                labelColor = labels[i-1];
                modeIndex = 2;
               }
               else
                modeIndex = i;
            });
         }
         for (var i = 0; i < labels.length; ++i) {
            var color = labels[i].color;
            var colorbox = document.createElement('span');
            colorbox.classList.add('legend-color-box');
            colorbox.style.backgroundColor =
                'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            var label = document.createElement('div');
            label.setAttribute('id',labels[i].id);
            label.classList.add('legend-item');
            label.classList.add('item');
            label.appendChild(colorbox);
            label.innerHTML += (labels[i].name);
            legend.appendChild(label);
            legend.appendChild(document.createElement('br'));
         }

         var item = document.getElementsByClassName('item');
         for (var i = 0; i < item.length; ++i) {
             attachClickEvent(item[i], i);
         }
        // currenIndex = label blue
         var currentIndex = 2;
         document.getElementsByClassName('item')[currentIndex].click();
      }

       function loadImage(url, callback) {
            var img = new Image();
            img.onload = function(){
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                var imgData = context.getImageData(0, 0, img.width, img.height);
                callback(imgData, canvas);
            }
            img.src = url;
        }

        function store() {

            var data = {label:'', border:'', merge:[]};
            step++;
            if (step < pushArray.length) { pushArray.length = step; }
            data.label = document.getElementById('label').toDataURL();
            data.border = bor_canvas.toDataURL();
            data.merge = mergeArray.slice();
            pushArray.push(data);

            if(step > 0)
               document.getElementById('undo-button').disabled = false;
            if(step === pushArray.length-1)
               document.getElementById('redo-button').disabled = true;
         }


      function initializeContainListener(width, height){
          var route, preHit, point, mousedown = false;

         //modeIndex: 0=split, 1=merge, 2=label
          var container = document.getElementById('label');
          container.addEventListener('mousedown', function(event) {
              if(modeIndex ===1){
                 mousedown = true;
                 route = [];
                 preHit = getClickPosition(event, this);
            //     route.push(preHit);
              }
          }, false);

          container.addEventListener('mousemove', function(event) {
            if(modeIndex===1 && mousedown){
              var hit = getClickPosition(event, this);
              route.push(hit);
              preHit = hit;
             }
          }, false);

          container.addEventListener('mouseup', function(event) {
             var hit = getClickPosition(event, this),
                 points = [];

             if(modeIndex===1){
                 for(var i =1; i<route.length;i++){
                  if(haveBorderWithin(route[i-1], route[i], width, label_imgData)){
                     points.push(route[i-1]);
                   }
                 }
                 if(!isBorder(hit.x, hit.y, width, label_imgData)){
                   points.push(hit);
                 }
                 if(points.length>1)
                  getSegmentPixels(points, width, height);
             }
             else{
               points.push(hit);
               getSegmentPixels(points, width, height);
             }

             mousedown = false;

          }, false);
      }

      function haveBorderWithin(p, l, width, data){
          var x= p.x<=l.x ? 1:-1;
          var y= p.y<=l.y ? 1:-1;

            for(var i=p.x+x; i!=l.x+x; i=i+x){
              if(isBorder(i, p.y, width, data))
                 return true;
            }


            for(var j=p.y+y; j!=l.y+y;j=j+y){
              if(isBorder(i, j,width,  data))
                return true;
            }

          return false;
      }

      function dilateK(k, width, height, indexMap){
         var dilatePixels = [];

         manhattanDilate(width, height, indexMap);

         for (var y=0; y<height; y++){
             for (var x=0; x<width; x++){
                if(indexMap[y*width+x]===0){
                   indexMap[y*width+x] = 1;
                }
                else if(indexMap[y*width+x] <= k){
                   indexMap[y*width+x] = 1;
                   dilatePixels.push(y*width+x);
                }
                else{
                   indexMap[y*width+x] = 0;
                }
              }
          }

          return dilatePixels;
      }

      function manhattanDilate(width, height, indexMap){

           for (var y=0; y<height; y++){
               for (var x=0; x<width; x++){
                    if (indexMap[y*width+x] == 1){
                        indexMap[y*width+x] = 0;
                    } else {
                        indexMap[y*width+x] = height + width;
                        if (y>0) indexMap[y*width+x] = Math.min(indexMap[y*width+x], indexMap[(y-1)*width+x]+1);
                        if (x>0) indexMap[y*width+x] = Math.min(indexMap[y*width+x], indexMap[y*width+x-1]+1);
                    }
                }
            }

           for (var y = height-1; y >= 0; y--){
              for (var x = width-1; x >= 0; x--){
                    if (y+1 < height) indexMap[y*width+x] = Math.min(indexMap[y*width+x], indexMap[(y+1)*width+x]+1);
                    if (x+1 < width) indexMap[y*width+x] = Math.min(indexMap[y*width+x], indexMap[y*width+x+1]+1);
              }
           }
     }


     function manhattanErosion(width, height, indexMap){

           for (var y=0; y<height; y++){
               for (var x=0; x<width; x++){
                    if (indexMap[y*width+x] == 0){
                        indexMap[y*width+x] = 1;
                    } else {
                        indexMap[y*width+x] = -height - width;
                        if (y>0) indexMap[y*width+x] = Math.max(indexMap[y*width+x], indexMap[(y-1)*width+x]-1);
                        if (x>0) indexMap[y*width+x] = Math.max(indexMap[y*width+x], indexMap[y*width+x-1]-1);
                    }
                }
            }

           for (var y = height-1; y >= 0; y--){
              for (var x = width-1; x >= 0; x--){
                    if (y+1 < height) indexMap[y*width+x] = Math.max(indexMap[y*width+x], indexMap[(y+1)*width+x]-1);
                    if (x+1 < width) indexMap[y*width+x] = Math.max(indexMap[y*width+x], indexMap[y*width+x+1]-1);
              }
           }
     }


      function erosionK(dilatePixels, pixels, ng_k, width, height, indexMap, enableBorder){

          manhattanErosion(width, height, indexMap);
        if(enableBorder === false){
          for(var i =0; i<dilatePixels.length;i++){
            if(indexMap[dilatePixels[i]] < ng_k && dilatePixels[i]>width && dilatePixels[i]<(height-1)*width && dilatePixels[i]%width!=0 && (dilatePixels[i]+1)%width!=0){
              pixels.push(dilatePixels[i]);
            }
          }
        }
        else{
          for(var i =0; i<dilatePixels.length;i++){
            if(indexMap[dilatePixels[i]] < ng_k){
              pixels.push(dilatePixels[i]);
            }
          }
        }

      }

      function isBorder(x, y, width, ImgData){
        var k = y*width + x;

        if(ImgData.data[4*k+0]<50 && ImgData.data[4*k+1]>150 && ImgData.data[4*k+2]<50)
          return true;
        return false;
      }

      function getClickPosition(e, parent){
         var mouse = {x:'', y:''};
         mouse.x = e.pageX - parent.offsetLeft + parent.scrollLeft;
         mouse.y = e.pageY - parent.offsetTop + parent.scrollTop;
         return mouse;

      //    consolze.log('Hit****  X:'+x+';'+'Y:'+y);
      };

      //indexMap: pixel index = true, if this pixel is added into pixels Array
      function getSegmentPixels(point, width, height){
         var pixels = [],
             k,
             mergeSegment = {state:'', no:''};
         var indexMap = new Array(width*height);

         for(var i=0; i< width*height;++i)
                indexMap[i] = 0;
         for(var i =0; i<point.length;i++){
            k = width*point[i].y + point[i].x;
            mergeSegment.state = false;

            for(var n=0; n<mergeArray.length; n++){
               for(var m=0; m<mergeArray[n].length; m++){

                  if(k===mergeArray[n][m]){
                    mergeSegment.state = true;
                    mergeSegment.no = n;
                    break;
                  }
               }
               if(mergeSegment.state)break;
            }

            if(mergeSegment.state){
               for(var t=0; t<mergeArray[mergeSegment.no].length; t++){
                 pixels.push(mergeArray[mergeSegment.no][t]);
                 indexMap[mergeArray[mergeSegment.no][t]] = 1;
               }
               mergeArray.splice(mergeSegment.no, 1);
            }
            else{
              getPixels(pixels, point[i].x, point[i].y, label_imgData, width, height, indexMap);
            }
         }

         if(pixels.length>0)
            updateSegments(pixels, width, height, indexMap);

      }


      function updateSegments(pixels, width, height,indexMap){
        switch(modeIndex){
          //split
           case 0:
             splitSegement(pixels);
             localStore(new Date().getTime(), "split-mode",pixels);
             break;
           //merge
           //k and ad can be further adjusted
           case 1:
             var k=3;
             var dilatePixels = dilateK(k, width, height, indexMap);
             erosionK(dilatePixels, pixels, -k, width, height, indexMap, false);
             mergeArray.push(pixels);
             mergeSegment(pixels);
             break;
           //label
           case 2:
             mergeArray.push(pixels);
             labelSegment(pixels);
             localStore(new Date().getTime(), labelColor.id,pixels);
             break;
         }
         store();
      }



      //green border pixels never added into pixels array
      function getPixels(pixels, x, y, data, width, height, indexMap){
        var k = y*width + x;

        if (!indexMap[k] && !(isBorder(x, y, width, data))){

          pixels.push(k);
          indexMap[k]=1;
          if(x-1>0)
            getPixels(pixels, x-1, y, data, width, height, indexMap);
          if(x+1<height)
            getPixels(pixels, x+1, y, data, width, height, indexMap);
          if(y-1>0)
            getPixels(pixels, x, y-1, data, width, height, indexMap);
          if(y+1<width)
            getPixels(pixels, x, y+1, data, width, height, indexMap);
        }
      }

     function drawPart(imageData){

                   var cvs = document.getElementById('part');
                   cvs.width = imageData.width;
                   cvs.height = imageData.height;
                   var ctx = cvs.getContext('2d');
                   var imPartData = ctx.getImageData(0, 0, cvs.width, cvs.height);
                   imPartData.data.set(imageData.data);

                  ctx.putImageData(imPartData,0,0);
     }

      function saveImage(imgData){

                var cvs = document.createElement("canvas");
                cvs.width = imgData.width;
                cvs.height = imgData.height;
                var ctx = cvs.getContext('2d');
                var imData = ctx.getImageData(0, 0, cvs.width, cvs.height);
                imData.data.set(imgData.data);
                ctx.putImageData(imData,0,0);

                var dataURL= cvs.toDataURL("image/png");

                return dataURL;
      }


      function splitSegement(segPixels){
        var splitted = true;
         for(var i = 0; i < segPixels.length; i++){
             if(Subseg_imgData.data[4*segPixels[i]+0]<50 && Subseg_imgData.data[4*segPixels[i]+1]>150 && Subseg_imgData.data[4*segPixels[i]+2]<50){
               splitted = false;
               break;
             }
         }

         if(!splitted){

             for(var i = 0; i < segPixels.length; i++){
                 copyPixelColor(Subseg_imgData, label_imgData, segPixels[i]);
                 copyPixelColor(Subseg_imgData, border_imgData, segPixels[i]);
             }
             context.putImageData(label_imgData,0,0);
             bor_canvas.getContext('2d').putImageData(border_imgData,0,0);
         }
         else{
             sweetAlert("Can not split","This segment has already been splitted.");
         }

      }

      function mergeSegment(segPixels){

            for(var i=0; i<segPixels.length; i++){
                 copyPixelColor(ori_imgData, label_imgData, segPixels[i]);
                 copyPixelColor(ori_imgData, border_imgData, segPixels[i]);
            }
            context.putImageData(label_imgData,0,0);
            bor_canvas.getContext('2d').putImageData(border_imgData,0,0);
      }

      function labelSegment(segPixels){

         if(labelColor.name =='Clear label'){
            for(var i=0; i<segPixels.length; i++){
                 copyPixelColor(ori_imgData, label_imgData, segPixels[i]);
            }
         }
         else{
             for(var i = 0; i < segPixels.length; i++){
                 setPixelLabelColor(labelColor.color, label_imgData, segPixels[i]);
             }
         }
         context.putImageData(label_imgData,0,0);
      }


      function copyPixelColor(copyData, pasteData, k){
        pasteData.data[ 4*k+0] = copyData.data[4*k+0];
        pasteData.data[ 4*k+1] = copyData.data[4*k+1];
        pasteData.data[ 4*k+2] = copyData.data[4*k+2];
        pasteData.data[ 4*k+3] = copyData.data[4*k+3];
      }

      function setPixelLabelColor(color, imgData, k){
        imgData.data[4*k+0] = color[0];
        imgData.data[4*k+1] = color[1];
        imgData.data[4*k+2] = color[2];
        imgData.data[4*k+3] = 255;
      }

      function boundaryEnabled(width, height){
        var colorMap = new Array(width * height),
            noBoundary_imgData = context.getImageData(0, 0, width, height),
            redPixels =[],
            bluePixels =[],
            k;

            noBoundary_imgData.data.set(label_imgData.data);

            //expand blue
            for (var y =0; y< height; y++){
               for (var x =0; x<width; x++){
                    k = y*width+x;
                    if(label_imgData.data[4*k+0]<50 && label_imgData.data[4*k+1]<50 && label_imgData.data[4*k+2]>150){
                       colorMap[k]=1;
                    }
                    else
                       colorMap[k]=0;
                }
             }
             erosionK( dilateK(3, width, height, colorMap), bluePixels, 0, width, height, colorMap, true);

             for (var i=0;i<bluePixels.length;i++)
                setPixelLabelColor([0,0,194], noBoundary_imgData, bluePixels[i]);

             //expand red
             for (var y =0; y< height; y++){
                for (var x =0; x<width; x++){
                  k = y*width+x;
                  if(label_imgData.data[4*k+0]>150 && label_imgData.data[4*k+1]<50 && label_imgData.data[4*k+2]<50){
                       colorMap[k]=1;
                  }
                  else
                       colorMap[k]=0;
                  }
             }
             erosionK(dilateK(3, width, height, colorMap), redPixels, -1, width, height, colorMap, true);

             for (var i=0;i<redPixels.length;i++)
                setPixelLabelColor([194,0,0], noBoundary_imgData, redPixels[i]);

             //rest green border
             for (var y =0; y< height; y++){
                for (var x =0; x<width; x++){
                   if(isBorder(x,y, width, noBoundary_imgData)){
                      k = y*width+x;
                  //    console.log(noBoundary_imgData.data[4*k+0]+','+noBoundary_imgData.data[4*k+1]+','+noBoundary_imgData.data[4*k+2]);
                      copyPixelColor(ori_imgData, noBoundary_imgData, k);
                   }
                }
              }
          return noBoundary_imgData;

      }


      function handleClick(e){
            var boundaryOn = document.getElementById('boundary-button').checked,
                fillOn = document.getElementById('fill-button').checked,
                canvas = document.getElementById('label');
            if(boundaryOn && fillOn){
              context.putImageData(label_imgData,0,0);
            }
            else if(boundaryOn){ //fillOn = false
              context.putImageData(border_imgData,0,0);
            }
            else if(fillOn){//boundaryOn = false
              context.putImageData(boundaryEnabled(canvas.width, canvas.height),0,0);
            }
            else{// false, false
              context.putImageData(ori_imgData, 0, 0);
            }

            localStore(new Date().getTime(), e.id, document.getElementById(e.id).checked);
      }

      function downloadAsFile(url, filename) {
        var anchor = document.createElement('a');
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.setAttribute('href', url);
        anchor.setAttribute('download', filename);
        anchor.click();
        document.body.removeChild(anchor);
      };



      function checkFinishlabelling(imgData, thres){
        var count = 0;
        for(var i =0; i<imgData.data.length/4; i=i+4){
          if((imgData.data[4*i+0]<50 && imgData.data[4*i+1]<50 && imgData.data[4*i+2]>150)||(imgData.data[4*i+0]>150 && imgData.data[4*i+1]<50 && imgData.data[4*i+2]<50)){
          }
          else{
            count++;
          }
          if(count>thres){
        //    console.log("Count"+count+"; i:"+i);
            return false;
          }
        }
         return true;
      }

      function savePost(imageIndex, index, imgData, mid){
           var dataURL = saveImage(imgData);
            $.ajax({
                type: "POST",
                url: "./save.php",
                data: {
                  'workerid': mid,
                  'index': imageIndex[index],
                  'length': imageIndex.length,
                  'image': dataURL
                },
                success:function(data) {
                   var result = JSON.parse(data);
                   console.log(data);

                   if(result.status){
                      //not the end
                      if(index < imageIndex.length-1){
                         document.getElementById('next-button').disabled = false;
                         sweetAlert("Saved","Click next to label another image.","success");
                         localStore(new Date().getTime(),'save-button', "success");
                      }
                      //the end
                      else{
                         document.getElementById('save-button').value = "Done!";
                         document.getElementById('save-button').disabled = true;
                         sweetAlert({
                                      title: "<small style='color:#949494'>Validation Code: </small><span style='color:#F8BB86'>"+result.token+"</span>",
                                      text: "<p style='text-align:left !important'><span style='font-weight:bold;font-style:italic;'>Thanks for participating!</span><br>To receive your payment, enter this validation code, and then click <span style='color:#85C5E6'>Submit</span>.<p>",
                                      html: true });
                         localStore(new Date().getTime(), 'save-button', "success-end");
                         retrieveSessionStorage(mid);
                         clearInterval(sesst);
                      }
                    }
                    else{
                        console.log('failed');
                        sweetAlert("Failed..","Please check your inernet connection.","error");
                        localStore(new Date().getTime(), 'save-button', "fail");
                    }
                 },
                 error: function(e) {
                    console.log('Error');
                    console.log(e);
                    sweetAlert("Error..","Internal server error, please try again.","error");
                    localStore(new Date().getTime(), 'save-button', "fail");
                 }
              });
      }


      function getParameterByName(name) {
         name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
         var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
         results = regex.exec(location.search);
         return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      }

      // Attach button events.
      function initializeButtons(imageIndex, index, mid) {
        document.getElementById('next-button').value = "Next  (1/"+imageIndex.length+")";

        document.getElementById('save-button').addEventListener('click', function() {
          var canvas = document.getElementById('label');
          var finishData = boundaryEnabled(canvas.width, canvas.height);

   //       if(checkFinishlabelling(finishData, 30)){
             localStore(new Date().getTime(), "save-button-finish", true);
             savePost(imageIndex, index, finishData, mid);
             localStore(new Date().getTime(), "save-button", false);
  /*        }
          else{
            localStore(new Date().getTime(), "save-button-finish", "no");
            sweetAlert({
              title: "Not yet complete",
              text: "Unlabelled segments remains. Do you still want to force saving?",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, save it anyway",
              cancelButtonText: "No, back to label",
              closeOnConfirm: false},
              function(isConfirm){
                if (isConfirm) {
                  localStore(new Date().getTime(), "save-button-continue", true);
                  if(checkFinishlabelling(finishData,4000)){
                     savePost(imageIndex, index, finishData, mid);
                     localStore(new Date().getTime(), "save-button-continue", "success");
                  }
                  else{
                     sweetAlert("Sorry","Too many unlablled segments. You have to continue labelling!","error");
                     localStore(new Date().getTime(), "save-button-continue", "fail");
                  }
                }
                else{
                  localStore(new Date().getTime(), "save-button-continue", false);
                }
              });
          }*/

        });

        document.getElementById('next-button').addEventListener('click', function() {
            var current;
            initializeImages(imageIndex[++index], function(width, height){
               current = index+1;
               document.getElementById('next-button').value = "Next  ("+current+"/"+imageIndex.length+")";
               localStore(new Date().getTime(), document.getElementById('next-button').id, current);
            });
        });

        document.getElementById('undo-button').addEventListener('click', function() {

            if (step > 0) {
              localStore(new Date().getTime(), this.id, 'click');
              step--;

              var undoLable = new Image();
              undoLable.onload = function(){
                context.drawImage(undoLable, 0, 0);
                label_imgData = context.getImageData(0, 0, undoLable.width, undoLable.height);
              }
              undoLable.src = pushArray[step].label;

              loadImage(pushArray[step].border, function(imgData, canvas){
                  border_imgData = imgData;
                  bor_canvas = canvas;
              })
              mergeArray = pushArray[step].merge.slice();

              document.getElementById('redo-button').disabled = false;
              if(step===0)
                document.getElementById('undo-button').disabled = true;
            }
        });

        document.getElementById('redo-button').addEventListener('click', function() {

             if (step < pushArray.length-1) {
                localStore(new Date().getTime(), this.id,'click');
                step++;

                var redoLable = new Image();
                redoLable.onload = function(){
                  context.drawImage(redoLable, 0, 0);
                  label_imgData = context.getImageData(0, 0, redoLable.width, redoLable.height);
                }
                redoLable.src = pushArray[step].label;

                loadImage(pushArray[step].border, function(imgData, canvas){
                    border_imgData = imgData;
                    bor_canvas = canvas;
                })
                mergeArray = pushArray[step].merge.slice();

                document.getElementById('undo-button').disabled = false;
                if(step === pushArray.length-1)
                  document.getElementById('redo-button').disabled = true;
             }
        });
      }
  </script>

