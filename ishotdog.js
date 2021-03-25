$(function ()
{
    console.log("hi");

    // preventing page from redirecting
    $("html").on("dragover", function (e)
    {
        e.preventDefault();
        e.stopPropagation();
        $("h2").text("Drag here");
    });

    $("html").on("drop", function (e) { e.preventDefault(); e.stopPropagation(); });

    // Drag enter
    $('.upload-area').on('dragenter', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
        $("h2").text("Drop");
    });

    // Drag over
    $('.upload-area').on('dragover', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
        $("h2").text("Drop");
    });

    // Drop
    $('.upload-area').on('drop', function (e)
    {
        console.log("Dropped!");

        e.stopPropagation();
        e.preventDefault();

        $("h2").text("Upload");

        var file = e.originalEvent.dataTransfer.files;

        populateImage(file[0]);

        console.log("StartResize", file[0]);
        resizeAndUploadImage(file[0]);
        console.log("Finished Resize");
    });

    // Open file selector on div click
    $("#uploadfile").click(function ()
    {
        console.log("Upload clicked!");
        $("#file").click();
    });

    // file selected
    $("#file").change(function ()
    {
        var file = $('#file')[0].files[0];
        populateImage(file);
        resizeAndUploadImage(file);
    });
});

function populateImage(file)
{
    $(".banner").hide();
    $("#title").hide();
    $("#thinking").show();
    $(".upload-area").hide();

    var reader = new FileReader();
    reader.onload = function (e)
    {
        //$('#image').attr('src', e.target.result);
        $('body').css("background-image", "url(" + e.target.result + ")");
    }
    reader.readAsDataURL(file);

}

// Sending AJAX request to Nyckel
function uploadData(imageBlob)
{
    var formdata = new FormData();
    formdata.append('file', imageBlob);

    console.log("START uploadData", Date.now(), formdata);

    $.ajax({
        url: '/ishotdog.php',
        type: 'post',
        data: formdata,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function (response)
        {
            console.log("FINISH uploadData", Date.now(), response);
            displayResult(response);
        },
        error: function(response)
        {
            console.error("FINISH uploadData", Date.now(), response);
            alert("Error uploading file!");
        }
    });


}

function resizeAndUploadImage(file)
{
    // from an input element
    // var filesToUpload = input.files;
    // var file = filesToUpload[0];
    console.log("resizeImage", file);

    // Ensure it's an image
    if (file.type.match(/image.*/))
    {
        console.log('An image has been loaded');

        // Load the image
        var reader = new FileReader();
        reader.onload = function (readerEvent)
        {
            var image = new Image();
            image.onload = function (imageEvent)
            {

                // Resize the image
                var canvas = document.createElement('canvas'),
                    max_size = 600,
                    width = image.width,
                    height = image.height;
                if (width > height)
                {
                    if (width > max_size)
                    {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else
                {
                    if (height > max_size)
                    {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = dataURLToBlob(dataUrl);

                uploadData(resizedImage);
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
    }
}

/* Utility function to convert a canvas to a BLOB */
var dataURLToBlob = function (dataURL)
{
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1)
    {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], { type: contentType });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i)
    {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}
/* End Utility function to convert a canvas to a BLOB      */

function displayResult(response)
{
    $("#thinking").hide();
    $(".upload-area").show();
    $("h2").text("Drag and drop JPG here or click to select file");

    if(response.name.toLowerCase().includes("not"))
    {
        $("#nothotdog").show();
    }
    else
    {
        $("#hotdog").show();
    }
    console.log(response);
}

// Added thumbnail
function addThumbnail(data)
{
    $("#uploadfile h2").remove();
    var len = $("#uploadfile div.thumbnail").length;

    var num = Number(len);
    num = num + 1;

    var name = data.name;
    var size = convertSize(data.size);
    var src = data.src;

    // Creating an thumbnail
    $("#uploadfile").append('<div id="thumbnail_' + num + '" class="thumbnail"></div>');
    $("#thumbnail_" + num).append('<img src="' + src + '" width="100%" height="78%">');
    $("#thumbnail_" + num).append('<span class="size">' + size + '<span>');

}

// Bytes conversion
function convertSize(size)
{
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (size == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
    return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
