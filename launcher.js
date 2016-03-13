var model = fr.imie.Model.build(),
	c1 = fr.imie.Champ.build(1, model),
	c2 = fr.imie.Champ.build(2, model),
	c3 = fr.imie.Champ.build(3, model),
	view = fr.imie.View.build(model, c1, c2, c3),
	controller = fr.imie.Controller.build(model, c1, c2, c3);

model.attach(view); // le model est observable par la view
c1.attach(view);
c2.attach(view);
c3.attach(view);
view.attach(controller); // ceci permet au controleur d'écouter les notifications de la vue (l'inverse est faux! la vue ne connait pas le controleur)
