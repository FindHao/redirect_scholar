# Redirect Scholar


A chrome extension to help you automatically redirect IEEE and ACM pages to the proxy pages provided by university libraries.

Extenstion: <https://chrome.google.com/webstore/detail/redirect-scholar/knpioldmlgeakfnldckjebeffhlplbff>

Homepage: <https://rs.findhao.net>

Code: <https://github.com/FindHao/redirect_scholar>

## Main Features

Notice:

There are two main features of Redirect Scholar.

### 1. Right Click Options

You can right click on the link you'd like to proxy and choose Redirect Scholar to manually proxy this link.

Thanks to [Chrome-ezproxy](https://github.com/tom5760/chrome-ezproxy). This feature is totally inherited from it.

Your school has to be included in this database, [proxies.json](https://github.com/FindHao/redirect_scholar/blob/master/proxies.json).
**Welcome to submit your PR to merge your university proxy options!**

### 2. Automatically redirect

When you access domains of `ieeexplore.ieee.org` and `dl.acm.org`, Redirect Scholar will automatically redirect your page to your university proxy.

Your school has to be included in this database, [proxies_redirect.json](https://github.com/FindHao/redirect_scholar/blob/master/proxies_redirect.json).
**Welcome to submit your PR to merge your university proxy options!**