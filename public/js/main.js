var rowCount;

jQuery(document).ready(function () {
  // jQuery.quicksearch
  jQuery('#search-text').quicksearch('#events tbody tr', {
    'onAfter': countRows
  });

  // change icon of search collapse
  var searchCollapse = jQuery('#search-collapse');
  var searchCollapseTobble = jQuery('[data-target="#search-collapse"]');
  searchCollapse.on('show.bs.collapse', function () {
    searchCollapseTobble.find('span').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
  });
  searchCollapse.on('hide.bs.collapse', function () {
    searchCollapseTobble.find('span').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
  });

  // checkbox filter
  var tableRows = jQuery('#events tbody tr');
  checkboxBtns = searchCollapse.find('.btn');
  checkboxBtns.click(function (evt) {
    if (evt.target.tagName.toLowerCase() !== 'label') return;
    jQuery(evt.target).toggleClass('active');
    var inactiveBtn = searchCollapse.find('.btn:not(.active)');
    if (inactiveBtn.length === 0) {
      tableRows.show();
      countRows();
      return;
    }
    jQuery.each(checkboxBtns, function () {
      jQuery(this).addClass('disabled');
    });
    var inactiveStr = '';
    jQuery.each(inactiveBtn, function () {
      inactiveStr += jQuery.trim(jQuery(this).text()) + '|';
    });
    var searchReg = new RegExp(inactiveStr.slice(0, -1));
    tableRows.hide().filter(function () {
      return !searchReg.test(jQuery(this).text().replace(/\s+/g, ' '));
    }).show();
    jQuery.each(checkboxBtns, function () {
      jQuery(this).removeClass('disabled');
    });
    countRows();
  });

  // count
  rowCount = jQuery('#events tbody tr').length;
  document.getElementById('matches').textContent = '(' + rowCount + '/' + rowCount + ')';
});

function countRows() {
  var dispNone = jQuery('#events tbody tr[style*="none"]').length;
  document.getElementById('matches').textContent = '(' + (rowCount - dispNone) + '/' + rowCount + ')';
}
