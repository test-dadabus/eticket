!function(e,t){function n(){var e=d.getBoundingClientRect().width,n=100*e/r;n=n>80?80:50>n?50:n,t.rem=n,d.style.fontSize=n+"px"}var i,o=e.document,d=o.documentElement,s=o.querySelector("#wjs-setrem")||d,r=s.getAttribute("data-design-width")||640;e.addEventListener("pageshow",function(e){e.persisted&&(clearTimeout(i),i=setTimeout(n,300))},!1),e.addEventListener("resize",function(){clearTimeout(i),i=setTimeout(n,300)},!1),n()}(window,window.wjs||(window.wjs={}));