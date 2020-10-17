var block_show = false;

function scrollTracking() {
  if (block_show) {
    return false;
  }

  var wt = $(window).scrollTop();
  var wh = $(window).height();
  var et = $('.active').offset().top;
  var eh = $('.active').outerHeight();
  var dh = $(document).height();

  if (wt + wh >= et || wh + wt == dh || eh + et < wh) {
    block_show = true;

    // Код анимации
    $('.active').show('fast', function () {
      $(this).next().show('fast', arguments.callee);
    });
  }
}

$(window).scroll(function () {
  scrollTracking();
});

$(document).ready(function () {
  scrollTracking();
});