// ========================================
// Jenkins Pipeline للـ Reservation System
// ========================================
// دا ملف تعليمات Jenkins بسيط جداً
// كل مرة تضغط Push ياخد الكود ويشتغل الخطوات دي:
// ========================================

pipeline {
    agent any
    
    tools {
        nodejs 'node20' 
    }
    
    // ====== متغيرات البيئة من .env ======
    // Jenkins بيقرأ المتغيرات من ملف .env الموجود في الـ repo
    environment {
        // بس تأكد أن ملف .env موجود محليًا
        DOTENV_FILE = '.env'
    }
    
    options {
        timestamps()
    }
    
    stages {
        stage('📋 تحضير المتغيرات') {
            steps {
                script {
                    echo '--- جاري التحقق من ملف .env ---'
                    if (fileExists('.env')) {
                        echo '✅ ملف .env موجود'
                        // اقرأ المحتوى
                        def envContent = readFile('.env')
                        echo '✅ تم تحميل المتغيرات من .env'
                    } else {
                        echo '⚠️ ملف .env غير موجود!'
                        echo 'سيتم استخدام .env.example كمثال'
                        sh 'cp .env.example .env'
                        echo '✅ تم إنشاء .env من .env.example - غير القيم الحساسة!'
                    }
                }
            }
        }
        
        stage('pull code from GitHub') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }
        
        stage('install npm packages') {
            steps {
                echo 'installing npm packages...'
                sh 'npm ci'
            }
        }
        
        stage('install and run tests') {
            steps {
                echo 'starting tests'
                sh 'npm test'
            }
        }
        
        // مرحلة 4: بناء Docker images (صور التطبيق و قاعدة البيانات)
        stage('4-Docker Images') {
            steps {
                echo '--- جاري بناء Docker Images (API + Database) ---'
                sh 'docker-compose build'
                echo '✅ تم البناء بنجاح!'
            }
        }
        
    }
    
    // لما تخلص كل المراحل
    post {
        success {
            echo '✅✅✅ JENKINS PIPELINE تمام التمام! ✅✅✅'
            echo 'كل المراحل شتغلت بدون مشاكل'
        }
        
        failure {
            echo '❌❌❌ حصلت مشكلة! ❌❌❌'
            echo 'شوف الـ logs فوق عشان تعرف المشكلة'
        }
    }
}