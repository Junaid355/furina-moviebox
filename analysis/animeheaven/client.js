// AnimeHeaven client & gate script
var maxep = 6;
var dfkey = "a36aecce528ead61b036cb7966026119";

function getcookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function gatea(x) {
  var d = new Date();
  d.setTime(d.getTime() + (48 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = "key=" + x + "; " + expires + ";path=/";
  if (localStorage.visited !== undefined) {
    var spl = localStorage.visited.split(x);
    if (spl.length <= 1) {
      localStorage.visited = localStorage.visited + x + "|";
    }
  } else {
    localStorage.visited = x + "|";
  }
}

function gateh(x) {
  var d = new Date();
  d.setTime(d.getTime() + (48 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = "key=" + x + "; " + expires + ";path=/";
}
