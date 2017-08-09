/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const shell = require('shelljs')
const fs = require('fs')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */

const APPCONFIGPATH = './appconfig.json'
const updateAppConfigActive = (appconfig, env = 'default') => {
	if (appconfig && appconfig.env) {
		appconfig.env.active = env
		const fileContent = JSON.stringify(appconfig, null, '\t')
		fs.writeFileSync(APPCONFIGPATH, fileContent)
	}
}

const exitIf = (exitCondition, exitMsg) => {
	if (exitCondition) {
		console.log(exitMsg.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}
}

exports.deploy = (env = 'default') => {
	const startClock = Date.now()
	exitIf(!fs.existsSync(APPCONFIGPATH), 'Missing appconfig.json file.')
	
	const appconfig =  require(APPCONFIGPATH)
	const environments = appconfig.env
	const hosting = appconfig.hosting

	exitIf(!environments, `${'appconfig.json'.italic.bold} is missing the ${'env'.italic.bold} property.`)
	exitIf(!hosting, `${'appconfig.json'.italic.bold} is missing the ${'hosting'.italic.bold} property. Add that property with one of those 2 values: googlecloud, firebase (e.g. "hosting": "googlecloud")`)
	exitIf(hosting != 'googlecloud' || hosting != 'firebase', `The value ${hosting.italic.bold} of the ${'hosting'.italic.bold} property in the ${'appconfig.json'.italic.bold} file is not valid. Choose one of the following 2 options: googlecloud or firebase`)

	const config = environments[env]

	exitIf(!config, `${'appconfig.json'.italic.bold} does not define any ${env.italic.bold} property under its ${'env'.italic.bold} property.`)

	if (hosting == 'googlecloud') {
		exitIf(!config.trigger, `${'appconfig.json'.italic.bold} does not define any ${'trigger'.italic.bold} property under its ${env.italic.bold} environment.`)
		exitIf(!config.entryPoint, `${'appconfig.json'.italic.bold} does not define any ${'entryPoint'.italic.bold} property under its ${env.italic.bold} environment.`)

		if (env == 'default') { // Local environment. Make Sure the Google function emulator is running.
			const functionsNotInstalled = !shell.exec('which functions', {silent:true}).stdout
			exitIf(functionsNotInstalled, `${'Google Function Emulator'.italic} seems to not be installed on your machine. \n\nYou cannot run this project on your local machine. To install it globally, simply run the following: \n${'npm install -g @google-cloud/functions-emulator'.bold.italic}`)

			const functionStatus = shell.exec('functions status', {silent:true}).stdout
			const functionsStopped = functionStatus.indexOf('│ STOPPED') > 0

			if (functionsStopped) {
				console.log('No emulator running. Time to start one!'.cyan)
				shell.exec('functions start')
			}

			updateAppConfigActive(appconfig, 'default')

			console.log(`${'LOCALLY'.italic.bold} deploying entry-point ${config.entryPoint.italic.bold} using trigger type ${config.trigger.italic.bold}.`.cyan)
			shell.exec(`functions deploy ${config.entryPoint} ${config.trigger}`)
		}
		else {
			exitIf(!config.functionName, `${'appconfig.json'.italic.bold} does not define any ${'functionName'.italic.bold} property under its ${env.italic.bold} environment.`)
			exitIf(!config.googleProject, `${'appconfig.json'.italic.bold} does not define any ${'googleProject'.italic.bold} property under its ${env.italic.bold} environment.`)
			exitIf(!config.bucket, `${'appconfig.json'.italic.bold} does not define any ${'bucket'.italic.bold} property under its ${env.italic.bold} environment.`)

			updateAppConfigActive(appconfig, env)

			console.log(`Deploying entry-point ${config.entryPoint.italic.bold} to ${`GOOGLE CLOUD FUNCTION ${config.functionName}`.italic.bold} located in project ${config.googleProject.italic.bold} using trigger type ${config.trigger.italic.bold}`.cyan)
			shell.exec(`gcloud config set project ${config.googleProject}`)
			shell.exec(`gcloud beta functions deploy ${config.functionName} --stage-bucket ${config.bucket} ${config.trigger} --entry-point ${config.entryPoint}`)
		}

		console.log(`Deployment successful (${(Date.now() - startClock)/1000} sec.)`.green)
	}
	else {
		if (env == 'default') { // Local environment. Make Sure the Google function emulator is running.
			const firbaseToolsNotInstalled = !shell.exec('which firebase', {silent:true}).stdout
			exitIf(firbaseToolsNotInstalled, `${'firebase-tools'.italic} seems to not be installed on your machine. \n\nYou cannot run this project on your local machine or even deploy it to firebase. To install it globally, simply run the following: \n${'npm install -g firebase-tools'.bold.italic}`)

			updateAppConfigActive(appconfig, 'default')

			console.log(`${'LOCALLY'.italic.bold} deploying entry-point ${config.entryPoint.italic.bold} using trigger type ${config.trigger.italic.bold}.`.cyan)
			shell.exec('firebase serve --only functions')
		}
		else {
			exitIf(!config.googleProject, `${'appconfig.json'.italic.bold} does not define any ${'googleProject'.italic.bold} property under its ${env.italic.bold} environment.`)

			updateAppConfigActive(appconfig, env)

			console.log(`Deploying entry-point ${config.entryPoint.italic.bold} to ${'FIREBASE'.italic.bold} located in project ${config.googleProject.italic.bold} using trigger type ${config.trigger.italic.bold}`.cyan)
			const switchProject = shell.exec(`firebase use ${config.googleProject}`).stdout
			exitIf(!switchProject, `Error trying to switch to the firebase project ${config.googleProject}. You're either not logged in (run ${'firebase login'.bold.italic}), or you do not have access to this project (contact the admin to get access).`)
			shell.exec('firebase deploy --only functions')
		}
	}
}



