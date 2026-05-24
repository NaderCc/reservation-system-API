pipeline {
    agent any
    tools {
        nodejs 'node20' 
    }
    stages {
        stage('build') {
            steps {
                sh 'npm ci'
            }
        }

        stage('test') {
            steps {
                sh 'npm test'
            }
        }
    }
}