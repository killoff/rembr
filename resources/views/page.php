<?php include 'meme.php' ?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
    <link type="text/css" rel="stylesheet" href="/css/local.css" media="screen,projection"/>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>

<body class="">
<header>
    <div class="navbar-fixed">
        <nav>
            <div class="nav-wrapper">
                <a href="/" class="brand-logo">Rembrus</a>
                <ul class="right">
                    <li>
                        <a class="user-menu-button" href="#!" data-activates="user-menu">
                            <?php echo $user->getAttribute('name'); ?>
                            <i class="material-icons right">arrow_drop_down</i>
                        </a>
                    </li>
                </ul>
                <div class="input-field right">
                    <input id="search" type="text" />
                    <label for="search"><i class="material-icons">search</i></label>
                </div>
            </div>
        </nav>
    </div>
</header>

<main id="main"></main>
<footer>
</footer>
<ul id="user-menu" class="dropdown-content">
    <li><a href="#!">Settings<!--i class="fa fa-cog right"></i--></a></li>
    <li><a href="#!">Log out<!--i class="fa fa-sign-out right"></i></a></li>
</ul>
<!--Import jQuery before materialize.js-->
<!--<script src="<?php echo asset('js/require.js') ?>"></script>-->
<script src="<?php echo asset('js/chrono/chrono.js') ?>"></script>
<script src="<?php echo asset('js/react/react-with-addons.min.js') ?>"></script>
<script src="<?php echo asset('js/react/JSXTransformer.js') ?>"></script>
<script src="<?php echo asset('js/react/director.js') ?>"></script>
<script src="<?php echo asset('js/app/utils.js') ?>"></script>
<script src="<?php echo asset('js/app/parser/tag.js') ?>"></script>
<script src="<?php echo asset('js/app/parser/moment.js') ?>"></script>
<script src="<?php echo asset('js/app/refiner/moment.js') ?>"></script>
<script src="<?php echo asset('js/app/refiner/tag.js') ?>"></script>
<script src="<?php echo asset('js/app/tool/moment.js') ?>"></script>
<script src="<?php echo asset('js/app/storage.js') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app/component/note.jsx') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app/component/tag.jsx') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app/component/main.jsx') ?>"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="<?php echo asset('js/Autolinker.min.js') ?>"></script>
<!--<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>-->
<script type="text/javascript" src="js/materialize.min.js"></script>
<!--<script src="--><?php //echo asset('js/todoModel.js') ?><!--"></script>-->
<script src="<?php echo asset('js/jquery/jquery.textcomplete.min.js') ?>"></script>
<script src="<?php echo asset('js/jquery/jquery.highlight-5.closure.js') ?>"></script>
<script src="<?php echo asset('js/moment.min.js') ?>"></script>
<script src="<?php echo asset('js/local.js') ?>"></script>
</body>
<script>
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
</script>
</html>
