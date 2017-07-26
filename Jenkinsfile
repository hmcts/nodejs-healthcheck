#!groovy

//noinspection GroovyAssignabilityCheck
properties(
  [[$class: 'GithubProjectProperty', projectUrlStr: 'http://github.com/hmcts/nodejs-healthcheck'],
   pipelineTriggers([
     [$class: 'GitHubPushTrigger'],
     [$class: 'hudson.triggers.TimerTrigger', spec: 'H 1 * * *']
   ])]
)

//noinspection GroovyUnusedAssignment Jenkins requires either an import or an _
@Library('Reform@feature/add-npm-registry-publish') _

String channel = '#jenkins-notifications'

node {
  try {
    stage('Checkout') {
      deleteDir()
      checkout scm
    }

    stage('Setup') {
      enforceNodeVersionBump
      sh 'yarn install'
    }

    stage('Test') {
      sh 'yarn test'
    }
    onPR {
    //onMaster {
      stage('Publish') {
        publishNodePackage publicRegistry: true
      }
    }

  } catch (Throwable err) {
    notifyBuildFailure channel: channel
    throw err
  }
  notifyBuildFixed channel: channel
}
