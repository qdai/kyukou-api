addEventListener('load', function () {
  // stay open fail log
  var fails = document.getElementsByClassName('panel-danger'),
      i, item;
  for (i = 0; i < fails.length; i++) {
    item = fails[i].getElementsByClassName('collapse')[0];
    item.classList.add('in');
    item.style.height = 'auto';
  }
}, false);
