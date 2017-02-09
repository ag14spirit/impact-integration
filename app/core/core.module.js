'use strict';

angular
    .module('app.core', [
        'ui.router', 'ui.router.stateHelper', 'ngMaterial', 'ngAnimate', 'ngResource', 'angulartics', 'angulartics.google.analytics'
    ]).config(function ($mdThemingProvider) {
      var customPrimary = {
       '50': '#ffffff',
       '100': '#f2f7f8',
       '200': '#e1ecef',
       '300': '#d0e1e7',
       '400': '#c0d7de',
       '500': '#AFCCD5',
       '600': '#9ec1cc',
       '700': '#8eb7c3',
       '800': '#7dacbb',
       '900': '#6ca1b2',
       'A100': '#ffffff',
       'A200': '#ffffff',
       'A400': '#ffffff',
       'A700': '#5b97a9',
       'impactDarkGrey': '#242424'
   };
   $mdThemingProvider
       .definePalette('customPrimary',
                       customPrimary);

   var customAccent = {
       '50': '#0b1214',
       '100': '#142024',
       '200': '#1d2f35',
       '300': '#273d45',
       '400': '#304c55',
       '500': '#395a66',
       '600': '#4b7886',
       '700': '#548697',
       '800': '#5f94a5',
       '900': '#6f9faf',
       'A100': '#4b7886',
       'A200': '#426976',
       'A400': '#395a66',
       'A700': '#80aab8'
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
          '50': '#c0c0c0',
          '100': '#b3b3b3',
          '200': '#a6a6a6',
          '300': '#999999',
          '400': '#8d8d8d',
          '500': '#808080',
          '600': '#737373',
          '700': '#666666',
          '800': '#5a5a5a',
          '900': '#4d4d4d',
          'A100': '#cccccc',
          'A200': '#d9d9d9',
          'A400': '#e6e6e6',
          'A700': '#404040'
      };
      $mdThemingProvider
          .definePalette('customBackground',
                          customBackground);

   $mdThemingProvider.theme('default')
       .primaryPalette('customPrimary')
       .accentPalette('customAccent')
       .warnPalette('customWarn')
       .backgroundPalette('grey')
});
