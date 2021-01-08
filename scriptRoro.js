// KingsAge Xpert user script
// version 0.03
// kingsage version 2.2.1
// 2012-04-24
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select <script name>, and click Uninstall.
//
// For windows to close automatically when action is completed,
// you must modify :
// dom.allow_scripts_to_close_windows in about:config
// --------------------------------------------------------------------
//
// ==UserScript==
// @name KingsAge Xpert X1
// @namespace http://
// @description Add-on to KingsAge to improve gameplay
// @version 0.02
// @author titi oklm
// @copyright (c) 2012-13
// @include http://*.kingsage.*game.php*
// @include http://*.kingsage.*redir.php*
// @include https://*.kingsage.*game.php*
// @include https://*.kingsage.*redir.php*
// ==/UserScript==

// MyPause
// =======
// Wait ms millisecond
const MyPause = ms =>
{
    const date = new Date();
    const curDate = null;

    do {
        curDate = new Date();
    }
    while (curDate-date < ms);
}

// getElementsByClass
// ==================
const getElementsByClass = (searchClass, node, tag) => 
{
    let classElements = new Array();

    if ( node == null )
        node = document;

    if ( tag == null )
        tag = '*';

    let els = node.getElementsByTagName(tag);
    let elsLen = els.length;
    let pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");

    for (i = 0, j = 0; i < elsLen; i++) {
        if ( pattern.test(els[i].className) ) {
            classElements[j] = els[i];
            j++;
        }
    }

    return classElements;
}


//
//
//    END OF FUNCTIONS
//
//


// Version actuelle
const version = 0.02;
// alert("Hit 0!");

/*
// Check for new version
window.checkVersion();
*/

// On récupère les valeurs dans l'URL pour savoir quoi faire
let qs = new Array();
let loc = location.search;
if (loc) {
    loc=loc.substring(1);
    var parms=loc.split('&');

    for (var i=0; i<parms.length; i++) {
        nameValue=parms[i].split('=');
        qs[nameValue[0]] = unescape(nameValue[1]);
    }
}

//////////////////////
// TROUPES ATTAQUANTES
// ===================
// Ajout d'un colonne pour indiquer, quand cela est possible, s'il y a un noble dans l'attaque
if ((qs['s'] == "ally") && (qs['m'] == "attacks")) {

    var elt = document.getElementsByTagName("body")[0];
    var txt = elt.innerHTML;
    var pos = txt.search("<th>Arrivée dans</th>");

    if (pos != -1) {
        // Ajout de la colonne
        elt.innerHTML = txt.substring(0, pos + 21) +
        "<th>Type</th>" +
        txt.substring(pos + 21 + 1);
        // GM_log (elt.innerHTML);

        // Toutes les lignes correspondant à une attaque ont pour classe 'countdown'
        var myData;
        myData = getElementsByClass("countdown", null, "span");
        // On traite chaque ligne, tant qu'il y en a
        for (var i=0; i<myData.length; i++) {
        var myChilds;
        var from;
        var to;
        var temps;

        // On récupère les noeuds du TR correspondant à cette ligne
        myChilds = myData[i].parentNode.parentNode.childNodes;
        // On récupère qui est attaqué
        // FIXME : marche pas sur le monde 8 sans premium ?) !
        from = myChilds[3].childNodes[6].firstChild.nodeValue;

                    var i1 = from.lastIndexOf("|");
        var xfrom = from.substring(0, i1);
        var yfrom = from.substring(i1 + 1);

        // On récupère l'attaquant
        if (myChilds[5].childNodes[8].childNodes.length == 0) { // Cas d'un attaquant sans alliance
            to = myChilds[5].childNodes[7].firstChild.nodeValue;
        }
        else { // Cas d'un attaquant avec alliance
            to = myChilds[5].childNodes[8].firstChild.nodeValue;
        }

        var i2 = to.lastIndexOf("|");
        var xto = to.substring(0, i2);
        var yto = to.substring(i2 + 1);

        // Calcul du temps de trajet pour un fake, résultat en secondes
        // On sait que c'est un noble, si le temps que l'on lit est plus grand que ce que
        // l'on calcule pour un belier (30 minutes par case)
        var dist = Math.sqrt((xfrom - xto)*(xfrom - xto) + (yfrom - yto)*(yfrom - yto));
        var tpsNoble = dist * 36 * 60;
        var tpsBelier = dist * 30 * 60;
        var tpsTemplier = dist * 22 * 60;
        var tpsspy = dist * 9 * 60;

        // On récupère le temps avant l'impact
        var strTpsAvantImpact = myData[i].firstChild.nodeValue;
        var tpsAvantImpactElem = strTpsAvantImpact.split(':');
        var tpsAvantImpact = 0;
        var xxx = tpsAvantImpactElem[0].indexOf("Jour");

        if (xxx != -1) {
            tpsAvantImpact = parseInt(tpsAvantImpactElem[0]) * 60*60*24;
            tpsAvantImpactElem[0] = tpsAvantImpactElem[0].substring(xxx+4);
        }
        
        tpsAvantImpact += parseInt(tpsAvantImpactElem[0]) * 60*60 + parseInt(tpsAvantImpactElem[1]) * 60 + parseInt(tpsAvantImpactElem[2]);

        var txt;
        var newTD = document.createElement('td');
                    var nature = "";

        // NOBLE DETECTE //
        if (tpsAvantImpact > tpsBelier) {
            nature = "[img_snob]";
            newTD.style.color = 'red';
        } else if(tpsAvantImpact > tpsTemplier) {
            nature = "[img_ram]";
            newTD.style.color = 'orange';
        } else if (tpsAvantImpact > tpsspy) {
            nature = "[img_sword]";
            newTD.style.color = 'green';
        } else{
            nature = "[img_spy]";
            newTD.style.color = 'deepskyblue';
        }

        // Ajout du texte
        myData[i].parentNode.parentNode.appendChild(newTD);
        newTD.innerHTML = '<b>' + nature + "</b>";
        }
    } else {
    alert("Ajout de la colonne pour le suivi des attaques impossible !");
    }
}

/* BEGIN SAVED VARIABLES
// URL VARIABLES
// END SAVED VARIABLES */
