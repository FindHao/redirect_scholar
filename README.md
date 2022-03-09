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

When you access domains of `ieeexplore.ieee.org` and `dl.acm.org`, Redirect Scholar will automatically redirect your page to your university proxy. If there is a login page, it is required by your university and it depends on when is the last time you login to your university system. 

Your school must be included in this database, [proxies_redirect.json](https://github.com/FindHao/redirect_scholar/blob/master/proxies_redirect.json).
**Welcome to submit your PR to merge your university proxy options!**

## How to contribute to this repo

If your university is not in those two database, and they have the support for easy proxy, welcome to submit a PR to add their proxy links.

For the proxyes_redirect database, your university must have a available proxy for IEEE and ACM. You can check it by the following steps.

1. Open your university library website
2. Find the database part
3. Find ACM and click it
4. If it is dl.acm.org, that means your university doesn't support easy proxy. 
5. If the url looks like dl-acm-org.prox.lib.ncsu.edu, congratulations! you can use this extension. Welcom to submit a PR to update our databse.


## Claim
We won't save or upload any user information. The only network request is to get the proxy databases. The login to library proxies is handled by your university. All of our code has been open sourced at Github.


