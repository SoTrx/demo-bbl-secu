
Pour cette démonstration, ce que l'on va essayer de faire, c'est de montrer une authentification à plusieurs niveaux.

Et pour ça, on va partir de quelque chose de très classique.

Je vais donc vous présenter ce programme, qui est écrit en Go. Le but de ce programme, qui est vraiment très simple, c'est de lister les groupes de ressources dans ma souscription Azure. 

Rapidement, les étapes c'est :
 - Je récupère les variables d'environnement dont j'ai besoin 
 - Avec cet environement, je vais pouvoir m'authentifier à Azure, c'est ce qui va nous intéresser
 - Et ensuite j'affiche les groupes de ressources dans la console

Ce programme il fonctionne très bien, voilà la trace, mais c'est pas le fait que ça focntionne qui va nous intéresser. Nous aujourd'hui on va plutôt parler authentificaton. Donc on va revenir à cette étape là dans le programme, et, si vous regardez le commentaire juste au dessus, vous verrez que je m'authentifie à Azure en utilisant un compte de service, un service principal.

Ce compte de service, il va pouvoir agir en mon nom avec un certain nombre de droits, et c'est une forme d'authentification d'un utilisateur particulier que l'on retrouve très souvent.  

Si c'est quelque chose qui est amplement suffisant pour ce que fait mon programme aujourd'hui, ça va être à la fois limité et limitant :
- limité parce que 


Mon rôle aujourd'hui ça va être de vous présenter différentes manière de s'authentifier dans Azure. 

La première c'est la plus classique, il s'agit de s'authentifier avec un identité généré par l'utilisateur. 
Dans ce programme, écrit en Go, c'est exactement ce que je fais. Je me log, 
Auth classique -> 