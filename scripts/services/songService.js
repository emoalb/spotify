const songService = (() => {
    function getAllSongs() {
        const endpoint = 'songs?query={}&sort={"likes":-1}';
        return remote.get('appdata', endpoint, 'kinvey');
    }

    function createSong(song) {
        return remote.post('appdata', 'songs', 'kinvey', song);
    }

    function deleteSong(id) {
        const endpoint = `songs/${id}`;
        return remote.remove('appdata', endpoint, 'kinvey');
    }
function listenSong(id,song){
    const endpoint = `songs/${id}`;

    return remote.update('appdata', endpoint, 'kinvey', song);
}
function getSongById(id) {
        const endpoint = `songs/${id}`;
        return remote.get('appdata', endpoint, 'kinvey');

}
function getMySongs(user_id) {
    const endpoint = `songs?query={"_acl.creator":"${user_id}"}&sort={"likes":-1, "listened":-1}`;
    return remote.get('appdata', endpoint, 'kinvey');
}

    return {
        getAllSongs,
        createSong,
        deleteSong,
        listenSong,
        getSongById,
        getMySongs
    }
})();
