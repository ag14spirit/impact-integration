'use strict';

angular
    .module('app.core', [
        'ui.router', 'ui.router.stateHelper', 'ngMaterial', 'ngAnimate', 'ngResource'
    ]).config(function ($mdThemingProvider) {
      var customPrimary = {
        '50': '#ffffff',
        '100': '#f3f7f8',
        '200': '#e2ecf0',
        '300': '#d1e1e7',
        '400': '#c1d7de',
        '500': '#B0CCD5',
        '600': '#9fc1cc',
        '700': '#8fb6c3',
        '800': '#7eacba',
        '900': '#6da1b2',
        'A100': '#ffffff',
        'A200': '#ffffff',
        'A400': '#ffffff',
        'A700': '#5d96a9'
    };
    $mdThemingProvider
        .definePalette('customPrimary',
                        customPrimary);

          var customAccent = {
             '50': '#0a1113',
             '100': '#132024',
             '200': '#1c2e35',
             '300': '#253d45',
             '400': '#2e4c56',
             '500': '#375a66',
             '600': '#497888',
             '700': '#528698',
             '800': '#5c94a7',
             '900': '#6d9fb0',
             'A100': '#497888',
             'A200': '#406977',
             'A400': '#375a66',
             'A700': '#7daab9'
         };

     $mdThemingProvider
         .definePalette('customAccent',
                         customAccent);

     var customWarn = {
         '50': '#ff9980',
         '100': '#ff8466',
         '200': '#ff704d',
         '300': '#ff5b33',
         '400': '#ff471a',
         '500': '#ff3200',
         '600': '#e62d00',
         '700': '#cc2800',
         '800': '#b32300',
         '900': '#991e00',
         'A100': '#ffad99',
         'A200': '#ffc2b3',
         'A400': '#ffd6cc',
         'A700': '#801900'
     };
     $mdThemingProvider
         .definePalette('customWarn',
                         customWarn);

     var customBackground = {
         '50': '#fbfbfb',
         '100': '#eeeeee',
         '200': '#e1e1e1',
         '300': '#d4d4d4',
         '400': '#c8c8c8',
         '500': '#BBB',
         '600': '#aeaeae',
         '700': '#a1a1a1',
         '800': '#959595',
         '900': '#888888',
         'A100': '#ffffff',
         'A200': '#ffffff',
         'A400': '#ffffff',
         'A700': '#7b7b7b'
     };
    $mdThemingProvider
        .definePalette('customBackground',
                        customBackground);

   $mdThemingProvider.theme('default')
       .primaryPalette('customPrimary')
       .accentPalette('customAccent')
       .warnPalette('customWarn')
       .backgroundPalette('customBackground')
});
