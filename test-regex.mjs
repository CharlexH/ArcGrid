function extractAttr(tag, name) {
  const regex = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match = tag.match(regex);
  return match ? match[2] : null;
}

console.log(extractAttr('<rect rx="12" x="0" y="0" width="48" height="48" fill="#FFFFFF" fill-opacity="1"/>', "x"));
console.log(extractAttr('<rect x="0" y="0" width="48" height="48" rx="12" fill="#FFFFFF" fill-opacity="1"/>', "x"));
