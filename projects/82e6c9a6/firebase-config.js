// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore path: /ccbotDev/[username]/apps/[projectID]
const PROJECT_ID = '82e6c9a6';
const USERNAME = 'nekokazu';
const FIRESTORE_PATH = `ccbotDev/${USERNAME}/apps/${PROJECT_ID}`;

// Save data to Firestore
export async function saveTokyoData(data) {
    try {
        const docRef = doc(db, FIRESTORE_PATH, 'tokyoData');
        await setDoc(docRef, {
            ...data,
            lastUpdated: new Date().toISOString()
        });
        console.log('Data saved to Firestore successfully');
        return true;
    } catch (error) {
        console.error('Error saving data to Firestore:', error);
        return false;
    }
}

// Load data from Firestore
export async function loadTokyoData() {
    try {
        const docRef = doc(db, FIRESTORE_PATH, 'tokyoData');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log('Data loaded from Firestore successfully');
            return docSnap.data();
        } else {
            console.log('No data found in Firestore');
            return null;
        }
    } catch (error) {
        console.error('Error loading data from Firestore:', error);
        return null;
    }
}

// Initialize sample data in Firestore (optional)
export async function initializeSampleData() {
    const sampleData = {
        population: {
            years: ['2015', '2017', '2019', '2021', '2023', '2025'],
            values: [13617445, 13843525, 14064696, 14047594, 14085790, 14097120]
        },
        ageDistribution: {
            labels: ['0-14歳', '15-24歳', '25-34歳', '35-44歳', '45-54歳', '55-64歳', '65歳以上'],
            values: [1534000, 1245000, 1789000, 1923000, 1856000, 1678000, 3072000]
        },
        districts: {
            labels: ['世田谷区', '練馬区', '大田区', '江戸川区', '足立区', '杉並区', '板橋区', '江東区', '葛飾区', '品川区'],
            values: [939698, 738279, 734024, 702789, 691895, 589602, 575441, 528360, 473522, 416870]
        },
        industries: {
            labels: ['卸売・小売業', '宿泊・飲食サービス業', '医療・福祉', '製造業', '情報通信業', '金融・保険業'],
            values: [1234500, 789600, 856300, 567200, 523400, 412800]
        },
        tourism: {
            months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            visitors: [1850000, 1920000, 2340000, 2890000, 2650000, 2450000, 2780000, 3120000, 2890000, 3240000, 2960000, 2450000]
        },
        transport: {
            labels: ['JR', '地下鉄', '私鉄', 'バス', 'タクシー'],
            values: [17500000, 8900000, 6700000, 1200000, 450000]
        }
    };

    return await saveTokyoData(sampleData);
}

console.log('Firebase initialized successfully');
