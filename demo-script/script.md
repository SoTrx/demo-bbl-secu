Ce compte de service, c'est souvent le premier contact qu'ont les developpeurs avec l'identité sur Azure. 
Je le rapelle, son cas d'utilisation c'est  "Comment s'authentifier avec un script qui tourne sur une machine qui n'est pas dans Azure".
Donc je suis un dev et je veux accéder à mon compte Azure pour faire, par exemple, des opérations de maintenance automatiques. 

[app.go]
Dans ce programme en particulier, qui est écrit en GO, je vais essayer de lister les différents groupes de ressources qui se trouvent dans ma souspsciption Azure.

Donc rapidement, ce programme il va commencer par récupérer la configuration via son environnement, s'identifier auprès d'Azure - c'est la partie qui va nous interesser aujourd'hui - et ensuite requéter à proprement parler l'API d'Azure pour avoir les groupes de ressources en question pour enfin les lister.

[executer app-cli]
Donc ce programme il fonctionne, mais c'est pas ça qui nous intéresse, ce qui nous intersse c'est : "Comment il fait pour accéder à Azure".

En fait, comme vous pouvez le voir ici, ce qu'il fait c'est qu'il utilise un compte de service - un service principal - c'est à dire une identité génerée qui va avoir des droits et des limites, ici il a le rôel Reader, puisqu'il n'y a pas besoin de plu.

A partir de là, j'ai juste à charger les variables de cette identté génerée  dans l'environnement et la bibliothèque Azure pour go sera capable de gérer l'authentification automatiquement.

Donc ça c'est quelque chose qui est très classique, utiliser des crendentials. Mais l'avantage du cloud public, c'est les fonctionnalités qui sont managées.

Et pour voir ça on va regarder un exemple un peu différent.
[Slide "Par la pratique : Managed Identity & App registration"]

Ensuite on va s'attaquer à la managed identity et à l'app registration. Donc voici une application type, j'ai un frontend qui est hébergé dans un hébergement d'application statique, et je veux que ce service puisse authentifier des utilisateurs humains. Comme ce sont des utilisateurs humains, j'utiliserai une App Registration. 
Ensuite, le backend de mon application statqique, qui est en serverless, a besoin d'aller chercher un secret dans un keyvault, le servcie de gestion de secrets managé d'Azure. Comme j'ai besoin d'accéder à un service Azure avec un programme qui lui aussi est sur Azure, je vais utliser une managed identity !


[Ouvrir app-vu en dev]

Donc on va plonger dans le code. Voici mon frontend en Vue. Ce frontend, c'est une sorte de dashboard qui présente à la fois de l'authentification et de l'authorisation.
Authentification parce ce que mon utilisateur doit être connecté, mais aussi autorisation parce ce que j'aid eux types d'utilisateurs:
- un user qui voit les trois premiers onglets
- un admin, avec lequel je suis connecté, qui a un panel d'aministration en plus
Là pour ma version de dev j'utilise des mocks, c'est facile je me fiche complétement de toute notion d'authentification.
Sauf que les mocks c'est une chose mais quand je vais passer en production, je vais bien devoir l'implémenter cette authetification
Pour ça, je pourrais tout à fait le faire à la main, implémenter un flow OpenID direct dans le code ou utiliser une bibliothèque comme passport par exemple.

[Ouvrir frontend/services/auth.service.ts]

Mais c'est pas ce que j'ai fais. Parce ce que si on jette un oeil au service d'autentification en production, tout ce qui est fait, c'est que je récupère mon utlisateur d'un endpoint spécifique `./auth/me`. Je n'ai absolument pas d'implémentation d'un quelconque processus d'authentification.

Ce qui veut dire que j'ai tout délégué à Azure. Mais comment ça se passe cette délégation ?

Eh bien il y a deux parties. 

La première elle est à côté de l'application, dans le fihicer `staticwebapp.config.json`, où je vais pouvoir définir déclarativement le role minimal nécessaire pour accéder à mes routes, ce qui m'évite de les définir dans le routeur de l'application, mais aussi le fournisseur d'identité. Ce fourniseur ici, on voit que c'est l'azure Active Directory, et plus particulièrement on voit que je renseigne un identifiant de "registration".

Et cette "registration" est en fait une "application registration, ou une "inscription d'aplication" en français, qui va l'objet qui va gérer l'authentification et les roles dans mon application. Je peux voir ici à la fois les roles que j'ai crée, mais aussi quels utilisateurs sont affectés à quels rôles.

Vous voyez ici que mon user a le role [ROLE] ce qui veut dire qu'il a le droit de [XXX]. Si je change son role, et que je me deconnecte reconencte, sa vue va changer.

Et c'est comme ça que l'on peut gérer l'authentification utilisateur dans Azure en ayant ce système déclaratif qui me permet à tout moment de débrancher l'authentification et d'en mettre une autre, mais aussi et surtout de ne pas avoir à maintenir à jour le fournisseur d'authentification.


Le troisième type d'authentification dont je vais parler aujourd'hui, c'est l'authentification d'un service Azure à un autre, en utilisant non pas des identités créee par l'utilisateur comme pour le premier exemple, mais des identités créees directement par Azure, des identité managées. 

[Image archi function + KV]
Pour l'exemple, j'ai mon frontend qui appelle une function serverless pour aller récupérer un secret sur mon keyvault, le coffre fort maangé d'Azure. L'appel de mon frontend vers ma function est déjà protégée par le mécanisme d'authentification que l'on vient de voir, mais il reste quand même à autoriser ma function à aller récupérer un secret dans le keyvault.  

Pour ça, je peux directement attribuer à ma fonction une identité managée en allant sur le portail, dans identité,et on lui attribuant. 

Ensuite dans le keyvault, je peux prendre cet ID d'identité et directement lui autoriser l'accès à récupérer les secrets en lecture seule. 

Et avec ça, je peux directement récupérer mon secret. 

Donc, pour résumer, un des attraits du Cloud public c'est de maintenir le moins de chose possible, et d'exploiter le côté PaaS au plus posisble. Eh bien c'est pareil avec l'Azure Active Directory, qui n'est pas seulement un annuaire LDAP mais qui peut aussi servir à la fois de moteur d'authentfication et d'autorisation.





