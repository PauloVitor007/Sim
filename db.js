// db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// COLOQUE AS SUAS CHAVES AQUI
const firebaseConfig = {
    apiKey: "AIzaSyBgfM-sKVlDPy8DnHfwqy9BCy6mFXPwQSQ",
    authDomain: "conecta-impacto-9a1fb.firebaseapp.com",
    projectId: "conecta-impacto-9a1fb",
    storageBucket: "conecta-impacto-9a1fb.firebasestorage.app",
    messagingSenderId: "40059584226",
    appId: "1:40059584226:web:85ebdf610285cff6c8e8bb",
    measurementId: "G-M0G4K5XLR0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Singleton Simples para o Banco
export default class DatabaseConnection {
    static async salvarVoluntario(dados) {
        try {
            const docRef = await addDoc(collection(db, "voluntarios"), dados);
            console.log("Voluntário salvo com ID: ", docRef.id);
            return true;
        } catch (e) {
            console.error("Erro ao salvar voluntário: ", e);
            return false;
        }
    }

    static async obterVoluntarios() {
        try {
            const querySnapshot = await getDocs(collection(db, "voluntarios"));
            const voluntarios = [];
            querySnapshot.forEach((doc) => {
                voluntarios.push({ id: doc.id, ...doc.data() });
            });
            return voluntarios;
        } catch (e) {
            console.error("Erro ao obter voluntários: ", e);
            return [];
        }
    }

    static async salvarOng(dados) {
        try {
            const docRef = await addDoc(collection(db, "ongs"), dados);
            console.log("ONG salva com ID: ", docRef.id);
            return true;
        } catch (e) {
            console.error("Erro ao salvar ONG: ", e);
            return false;
        }
    }

    static async obterOngs() {
        try {
            const querySnapshot = await getDocs(collection(db, "ongs"));
            const ongs = [];
            querySnapshot.forEach((doc) => {
                ongs.push({ id: doc.id, ...doc.data() });
            });
            return ongs;
        } catch (e) {
            console.error("Erro ao obter ONGs: ", e);
            return [];
        }
    }
}
