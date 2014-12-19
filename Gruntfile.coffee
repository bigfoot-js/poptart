module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    uglify:
      build:
        src: "dist/scripts/poptart.js"
        dest: "dist/scripts/poptart.min.js"

    coffee:
      specs:
        src: "spec/poptart_spec.coffee"
        dest: "spec/js/poptart_spec.js"

    browserify:
      build:
        src: "src/coffee/**/*.coffee"
        dest: "dist/scripts/poptart.js"
        options:
          transform: ["coffeeify"]

    jasmine:
      build:
        src: "dist/scripts/poptart.js"
        options:
          specs: "spec/js/poptart_spec.js"
          vendor: [
            "node_modules/jasmine-jquery/vendor/jquery/jquery.js"
            "node_modules/jasmine-jquery/lib/jasmine-jquery.js"
          ]

    sass:
      build:
        src: "src/scss/poptart.scss"
        dest: "dist/styles/poptart.css"
        options:
          style: "expanded"
          sourcemap: "none"

    autoprefixer:
      build:
        src: "dist/styles/poptart.css"
        dest: "dist/styles/poptart.css"

    compare_size:
      files: [
        "dist/scripts/poptart.js"
        "dist/scripts/poptart.min.js"
        "dist/styles/poptart.css"
      ]
      options:
        compress:
          gz: (contents) ->
            require("gzip-js").zip(contents, {}).length

    concat:
      options:
        stripBanners: true
        banner: "// <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy.mm.dd') %>\n\n\n"
        separator: "\n\n\n// -----\n\n\n"

    shell:
      main:
        command: [

        ].join("&&")

    watch:
      options:
        livereload: true

      core:
        files: "src/coffee/**/*.coffee"
        tasks: [
          "browserify"
          "uglify"
        ]
        options:
          spawn: false

      specs:
        files: "spec/**/*.coffee"
        tasks: [
          "coffee:specs"
          "jasmine"
        ]
        options:
          spawn: false

      scss:
        files: "src/**/*.scss"
        tasks: [
          "sass"
          "autoprefixer"
        ]
        options:
          spawn: false


  # 2. TASKS
  require("load-grunt-tasks")(grunt)

  # 3. PERFORM
  grunt.registerTask "default", [
    "browserify"
    "coffee"
    "uglify"
    "concat"
    "sass"
    "autoprefixer"
    "compare_size"
  ]

  grunt.registerTask "styles", [
    "concat"
    "sass"
    "autoprefixer"
    "compare_size"
  ]

  grunt.registerTask "scripts", [
    "browserify"
    "coffee"
    "uglify"
    "jasmine"
    "compare_size"
  ]

  grunt.registerTask "spec", [
    "browserify"
    "coffee"
    "jasmine"
  ]
