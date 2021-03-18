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
        var fd = new FormData();

        fd.append('file', file[0]);

        populateImage(file[0]);
        uploadData(fd);
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
        var fd = new FormData();

        var files = $('#file')[0].files[0];

        fd.append('file', files);

        populateImage(files);
        uploadData(fd);

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
function uploadData(formdata)
{
    console.log("uploadData", formdata);

    $.ajax({
        url: 'https://www.nyckel.com/v0.9/functions/km6svjpscep917bc/invoke',
        type: 'post',
        data: formdata,
        contentType: false,
        processData: false,
        dataType: 'json',
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjczNEE2RDZGQzMzMTcyRjE5RTMyOTFDQURCNzM2RTY5IiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2MTYwNDYwOTAsImV4cCI6MTYxNjA0OTY5MCwiaXNzIjoiaHR0cHM6Ly93d3cubnlja2VsLmNvbSIsImNsaWVudF9pZCI6ImNhNHBsOXZkZ2d5enRueWdta3ZkdG95OXV6bzBlZ3V1IiwianRpIjoiMTI0RjM1OTI4MTM1MEU3NkZCRTFGNDFCODdDMEMxRTIiLCJpYXQiOjE2MTYwNDYwOTAsInNjb3BlIjpbImFwaSJdfQ.Y5ZoNbOUUGsXAThxGaZcDb4Wh_EDm5QqA5XMcG9cDCoeBfsPkZJKT4BOqPlAOciHXGtmw0xJ4hXDucxzXL6Geoq6pAP7JFiK5ZZu2r69aC2Fce46djNT22wfDAMuztjgaIktF7mJYwOi98mg_63H6dludSdINLCUnWlIYwWD8t_Y_yIvUBlNFrKUQ7Sd4nHUyovBtHG0ZsNlfgMgZaoXIkuzf_Zw1OXqM8yOqMQ1lL6BwoE2VjMb57FTDyjVys2D2xmPRByMw4vrmCmJ9-TFdITShFAwcj_okPCb23HXCeLsppRbCmE5Pr2El6gs3X2q2_5FeET2AejyHc7Bx8bHmA');
        },
        success: function (response)
        {
            console.log(response);
            displayResult(response);
        },
        error: function(response)
        {
            console.error(response);
            alert("Error uploading file!");
        }
    });
}

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
