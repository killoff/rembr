<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link type="text/css" rel="stylesheet" href="/css/local.css" media="screen,projection"/>
    <!--<link type="text/css" rel="stylesheet" href="css/materialize.min.css" media="screen,projection"/>-->
</head>

<body class="">
<header>
    <nav>
        <div class="nav-wrapper">
            <div class="col s12">
                <a class="brand-logo">999notes</a>
                <ul class="right side-nav">
                    <li><a href="#"><i class="mdi-action-search left"></i></a></li>
                    <li><a href="#"><i class="mdi-action-view-module right"></i><?php echo $user->getAttribute('name'); ?></a></li>
                </ul>
            </div>
        </div>
    </nav>
</header>

<main id="main"></main>
<footer>
</footer>

<!--Import jQuery before materialize.js-->
<script src="<?php echo asset('bower_components/react/react-with-addons.js') ?>"></script>
<script src="<?php echo asset('bower_components/react/JSXTransformer.js') ?>"></script>
<script src="<?php echo asset('bower_components/director/build/director.js') ?>"></script>
<script src="<?php echo asset('js/utils.js') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app/note.jsx') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app/tag.jsx') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app.jsx') ?>"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<!--<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>-->
<script type="text/javascript" src="js/materialize.min.js"></script>
<!--<script src="--><?php //echo asset('js/todoModel.js') ?><!--"></script>-->
<script src="<?php echo asset('plugins/jquery.textcomplete.min.js') ?>"></script>
</body>
</html>
