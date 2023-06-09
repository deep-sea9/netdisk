window.FileSha = {

}

FileSha.Methods = {
    sha256 : function(file, limitSize, cb){
        var sha = '';

        var blob = file.getSource();
        var fileSize = blob.size;
        var blobSlice =  blob.mozSlice || blob.webkitSlice || blob.slice;
        var chunkSize =  6 * 1024 * 1024;
        var chunks = Math.ceil( fileSize / chunkSize);
        var chunk = 0;
        var totalSize = 0;

        var fr = new FileReader();
        var hasher = CryptoJS.algo.SHA256.create();
        var  loadnext = function(){
            var start, end;
            start = chunk * chunkSize;
            end = Math.min( start + chunkSize, fileSize);
            totalSize += (end - start);

            fr.onload = function(evt) {
                var fileStr = evt.target.result;
                var tmpWordArray = FileSha.Methods.arrayBufferToWordArray(fileStr);
                hasher.update(tmpWordArray);
            };

            fr.onloadend = function() {
                fr.onloadend = fr.onload = null;
                chunk++;

                var isEnd = false;
                if ( chunk < chunks ) {
                    if(totalSize > limitSize){
                        isEnd = true;
                    }
                } else {
                    isEnd = true;
                }

                if(isEnd){
                    setTimeout(function(){
                        sha = hasher.finalize();
                        if(cb){
                            cb(sha);
                        }
                        loadnext = null;
                        hasher = null;
                        blob = null;
                    },  50);
                } else{
                    setTimeout( loadnext, 1);
                }
            };

            var data = blobSlice.call( blob, start, end );
            fr.readAsArrayBuffer( data.getSource() );
        }
        loadnext();
    },

    arrayBufferToWordArray : function(buf) {
        var i8a = new Uint8Array(buf);
        var a = [];
        for (var i = 0; i < i8a.length; i += 4) {
            a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
        }
        return CryptoJS.lib.WordArray.create(a, i8a.length);
    }
}
