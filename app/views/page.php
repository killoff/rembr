<!doctype html>
<html lang="en" data-framework="react">
<head>
    <meta charset="utf-8">
    <title>999 notes</title>
    <link rel="stylesheet" href="<?php echo asset('bower_components/todomvc-common/base.css') ?>">
</head>
<body>
<section id="todoapp"></section>
<footer id="info">
    <p>Double-click to edit a todo</p>
</footer>

<script src="<?php echo asset('bower_components/todomvc-common/base.js') ?>"></script>
<script src="<?php echo asset('bower_components/react/react-with-addons.js') ?>"></script>
<script src="<?php echo asset('bower_components/react/JSXTransformer.js') ?>"></script>
<script src="<?php echo asset('bower_components/director/build/director.js') ?>"></script>

<script src="<?php echo asset('js/utils.js') ?>"></script>
<script src="<?php echo asset('js/todoModel.js') ?>"></script>
<!-- jsx is an optional syntactic sugar that transforms methods in React's
`render` into an HTML-looking format. Since the two models above are
unrelated to React, we didn't need those transforms. -->
<script type="text/jsx" src="<?php echo asset('js/todoItem.jsx') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/footer.jsx') ?>"></script>
<script type="text/jsx" src="<?php echo asset('js/app.jsx') ?>"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="<?php echo asset('plugins/jquery.textcomplete.min.js') ?>"></script>

<script type="text/javascript">
    $(function() {
        var elements = ['span', 'div', 'h1', 'h2', 'h3'];
        $('#new-todo').textcomplete([
            { // html
                match: /<(\w*)$/,
                search: function (term, callback) {
                    console.log('search');
                    callback($.map(elements, function (element) {
                        return element.indexOf(term) === 0 ? element : null;
                    }));
                },
                index: 1,
                replace: function (element) {
                    return ['<' + element + '>', '</' + element + '>'];
                }
            }
        ]);
    });

</script>
</body>
</html>
