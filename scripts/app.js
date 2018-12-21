$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');
        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);
        this.get('#/register', (ctx) => {
            ctx.loadPartials({
                    header: './templates/partials/header.hbs',
                    footer: './templates/partials/footer.hbs'
                }
            ).then(function () {
                this.partial('./templates/forms/register.hbs');
            });
        });
        this.post('#/register', (ctx) => {

            let username = ctx.params.username;
            let password = ctx.params.password;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                notify.showError('Username should be at least 3 characters long and contain only english alphabet letters');
            } else if (!/^[A-Za-z\d]{6,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and contain only english alphabet letters');
            } else {

                auth.register(username, password)
                    .then((authData) => {
                        auth.saveSession(authData);
                        notify.showInfo('User registration successful!');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/login', (ctx) => {
            ctx.loadPartials({
                    header: './templates/partials/header.hbs',
                    footer: './templates/partials/footer.hbs'
                }
            ).then(function () {
                this.partial('./templates/forms/login.hbs');
            });
        });
        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            if (username === '' || password === '') {
                notify.showError('All fields should be non-empty!');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });
        this.get('#/logout', (ctx) => {
            auth.logout().then(() => {
                sessionStorage.clear();
                notify.showInfo('Logout successful.');
                getWelcomePage(ctx);
            }).catch(notify.handleError);
        });
        this.get('#/create', (ctx) => {
            ctx.isAuth = auth.isAuth();
            if (!ctx.isAuth) {
                getWelcomePage(ctx);
            } else {
                ctx.loadPartials({
                    header: './templates/partials/header.hbs',
                    footer: './templates/partials/footer.hbs'
                }).then(function () {
                    this.partial('./templates/forms/create-new.hbs')

                });

            }
        });
        this.post('#/create', (ctx) => {
            let title = ctx.params.title;
            let artist = ctx.params.artist;
            let imageURL = ctx.params.imageURL;
            let likes = 0;
            let listened = 0;

            if (!/^.{6,}$/.test(title)) {
                notify.showError('Song title should be at least 6 characters long ');
            } else if (!/^.{3,}$/.test(artist)) {
                notify.showError('Song artist should be at least 3 characters long ');
            } else if (!(imageURL.startsWith("http://")
                    || imageURL.startsWith("https://"))) {
                notify.showError('Image URL should start with http:// or https://');
            } else {
                let song = {title, artist, imageURL, likes, listened};
                songService.createSong(song).then(ctx.redirect('#/all-songs'));
            }

        });
        this.get('#/remove/:id', (ctx) => {
                let id = ctx.params.id;
                songService.deleteSong(id).then(() => {
                    notify.showInfo("Song removed successfully!");
                    ctx.redirect('#/all-songs');
                })
            }
        );
        this.get('#/listen/:id', (ctx) => {
            let id = ctx.params.id;
            songService.getSongById(id).then((song) => {
                song.listened++;
                songService.listenSong(id, song).then(() => {
                    notify.showInfo(`You just listened ${song.title}`);
                    ctx.redirect('#/all-songs');
                })
            });


        });
        this.get('#/like/:id', (ctx) => {
            let id = ctx.params.id;
            songService.getSongById(id).then((song) => {
                song.likes++;
                songService.listenSong(id, song).then(() => {
                    notify.showInfo(`Liked!`);
                    ctx.redirect('#/all-songs');
                })
            });


        });
        this.get('#/my-songs', (ctx) => {
            ctx.isAuth = auth.isAuth();
            if (!ctx.isAuth) {
                ctx.redirect('#/home')
            } else {
                songService.getMySongs(sessionStorage.getItem('userId')).then((songs) => {
                    songs.forEach((p, i) => {
                        p.isCreator = p._acl.creator === sessionStorage.getItem('userId');
                    });
                    ctx.username = sessionStorage.getItem('username');
                    ctx.songs = songs;
                    ctx.loadPartials({

                        header: './templates/partials/header.hbs',
                        footer: './templates/partials/footer.hbs',
                        song: './templates/song.hbs'
                    }).then(function () {
                        this.partial('./templates/my-songs.hbs')

                    });
                });
            }
        });


        this.get('#/all-songs', (ctx) => {
            ctx.isAuth = auth.isAuth();
            if (!ctx.isAuth) {
                ctx.redirect('#/home')
            } else {
                let songs = [];
                songService.getAllSongs().then((songsraw) => {
                    songsraw.forEach((p, i) => {
                        p.isCreator = p._acl.creator === sessionStorage.getItem('userId');
                        if (!p.isCreator) {
                            songs.push(p);
                        }
                    });
                    songService.getMySongs(sessionStorage.getItem('userId')).then((mySongs) => {
                        mySongs.forEach((p, i) => {
                            p.isCreator = p._acl.creator === sessionStorage.getItem('userId');
                            songs.push(p);

                        });
                        ctx.username = sessionStorage.getItem('username');
                        ctx.songs = songs;
                        ctx.loadPartials({

                            header: './templates/partials/header.hbs',
                            footer: './templates/partials/footer.hbs',
                            song: './templates/song.hbs'
                        }).then(function () {
                            this.partial('./templates/all-songs.hbs')

                        });
                    });


                });
            }
        });

        function getWelcomePage(ctx) {

            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/partials/header.hbs',
                footer: './templates/partials/footer.hbs'
            }).then(function () {
                this.partial('./templates/welcome-guest.hbs')

            });
            ctx.redirect('#/home');


        }


    });

    app.run();
});