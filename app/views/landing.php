<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign in - 999 notes</title>
    <style>
        @import url(//fonts.googleapis.com/css?family=Lato:700);

        body {
            margin:0;
            font-family:'Lato', sans-serif;
            text-align:center;
            color: #999;
        }

        .welcome {
            width: 300px;
            height: 200px;
            position: absolute;
            left: 50%;
            top: 50%;
            margin-left: -150px;
            margin-top: -100px;
        }

        .message {
            color: white;
            padding: 10px;
            background-color: orangered;
        }

        a, a:visited {
            text-decoration:none;
        }

        h1 {
            font-size: 32px;
            margin: 16px 0 0 0;
        }
    </style>
</head>
<body>
<script>
    /*
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '1521924611416223',
            xfbml      : true,
            version    : 'v2.2'
        });
    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    */
</script>
<div class="welcome">
    <?php if (Session::get('message')): ?>
        <div class="message">
            <?php echo Session::get('message') ?>
        </div>
    <?php endif ?>
    Use <a href="<?php echo route('googleLogin') ?>">Google</a> or <a href="<?php echo route('facebookLogin') ?>">Facebook</a> to sign in.
</div>
</body>
</html>
