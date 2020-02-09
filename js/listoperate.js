function sortByColumn(property){
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    if (property == 'AddTime') {
      value1 = Date.parse(value1);
      value2 = Date.parse(value2);
    }
    return value2 - value1;//降序
    //return value1 - value2;//升序
  }
}

module.exports = {
  sortByColumn: sortByColumn,
}
