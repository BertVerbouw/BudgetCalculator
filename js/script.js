function saveToFirebase(ref, object) {
    firebase.database().ref(ref).push().set(object)
        .then(function (snapshot) {}, function (error) {
            console.log('error' + error);
        });
}

function getFirebaseData(child) {
    var ref = firebase.app().database().ref(ref);
    var childref = ref.child(child);
    childref.once('value')
        .then(function (snap) {
            updateHtml(snap, child);
        });
}

function updateHtml(data, section) {
    data.forEach(function (snapshot) {
        var obj = snapshot.val();
        var list = document.getElementById(section + 'data');
        var entry = document.createElement('li');
        entry.appendChild(document.createTextNode(obj.name));
        list.appendChild(entry);
        console.dir(obj);
    });
}

getFirebaseData('living');
getFirebaseData('keuken');
