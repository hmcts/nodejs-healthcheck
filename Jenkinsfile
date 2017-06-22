#!groovy

properties(
    [[$class: 'GithubProjectProperty', projectUrlStr: 'http://git.reform.hmcts.net/reform/nodejs-healthcheck'],
     pipelineTriggers([
         [$class: 'GitHubPushTrigger'],
         [$class: 'hudson.triggers.TimerTrigger', spec  : 'H 1 * * *']
     ])]
)

node {
    try {
        stage('Checkout') {
            deleteDir()
            checkout scm
        }

        stage('Setup') {
            sh 'npm install'
        }

        stage('Test') {
            sh 'npm test'
        }
    } catch (err) {
        slackSend(
            channel: '#development',
            color: 'danger',
            message: "${env.JOB_NAME}:  <${env.BUILD_URL}console|Build ${env.BUILD_DISPLAY_NAME}> has FAILED")
        throw err
    }
}
