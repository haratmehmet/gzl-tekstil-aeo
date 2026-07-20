const parse = (val) => {
  let clean = val.replace(/[^0-9.,-]/g, '');
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  return parseFloat(clean) || 0;
}
console.log(parse("1.500,50 Mt"));
console.log(parse("200"));
console.log(parse("1500,50"));
