/* Runs before paint: apply saved theme (or OS preference) to avoid a flash. */
(function(){try{var t=localStorage.getItem('k8s-notes:theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();
