'use strict';

module.exports = (date, youbi) => {
  return ['日', '月', '火', '水', '木', '金', '土', '日'][date.getDay()] === youbi;
};
