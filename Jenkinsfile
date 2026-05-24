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
        dockerTool 'docker20'
    }
    
    
    environment {
        PORT = '9090'
        DB_USER = 'postgres'
        DB_NAME = 'reservation_db'
        DB_HOST = 'localhost' 
        DB_PORT = '5430'
        
        DB_PASSWORD = credentials('db-password-id')
        JWT_SECRET  = credentials('jwt-secret-id')
    }
    
    options {
        timestamps()
    }
    
    stages {
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
        stage('4-Docker Compose Deploy') {
            steps {
                echo '--- جاري التشغيل باستخدم docker-compose الفعلي ---'
                sh """
                        docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v \$(pwd):\$(pwd) \
                        -w \$(pwd) \
                        docker/compose:v2.24.5 up -d --build
                    """
            }
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
            echo '❌❌❌ حصلت مشكلة! '
            echo 'شوف الـ logs فوق عشان تعرف المشكلة'
        }
    }

