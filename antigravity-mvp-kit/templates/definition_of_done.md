# Definition of Done — à respecter pour chaque fonctionnalité livrée

Une fonctionnalité est "Done" quand :
- [ ] Le code respecte l'architecture 3-tiers (présentation / applicatif / données)
- [ ] RLS activée et testée sur les tables concernées
- [ ] Responsive vérifié sur mobile et desktop
- [ ] Temps de chargement acceptable sur connexion lente (test avec throttling réseau)
- [ ] Gestion des erreurs (formulaire, réseau, permissions) avec messages clairs pour l'utilisateur
- [ ] Aucune clé Supabase ni secret committé dans le code
- [ ] Code commenté et lisible (commentaires métier en français)
- [ ] Testé manuellement selon le cas d'utilisation principal correspondant (cahier des charges, section "Cas d'utilisation")
