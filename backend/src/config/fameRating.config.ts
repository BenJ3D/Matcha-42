export default {
    like: 0.1,  //ajout d'un like
    dislike: -0.1, //suppression d'un like
    unlike: -0.1, //ajout d'un unlike
    disunlike: 0.1, // suppression d'un unlike
    match: 0.4, // ajout d'un match
    unmatch: -0.4, // suppression d'un match
    blocked: -0.2, // bloquage d'un user -> malus target user
    unblocked: 0.2, // suppression du blocage d'un user
    fake: -0.6, // declaration d'un user comme fake
    unfake: 0.6, // suppression de la declaration d'un user comme fake
}