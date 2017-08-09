const shell = require('shelljs')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */

const sanitizeDest = dest => dest ? dest.split(' ').map(x => x.trim().toLowerCase()).join('') : null
const sanitizeProjectName = name => name ? name.split(' ').join('-') : null
const sanitizeEntryPoint = name => name ? name.split(' ').join('').replace('-','') : null
const sanitizeFunctionName = name => name ? name.trim().split(' ').map(x => x.toLowerCase()).join('-') : null
const sanitizeBucket = name => name ? name.trim().split(' ').map(x => x.toLowerCase()).join('-') : null
const TRIGGERS = { '1': '--trigger-http', '2': '--trigger-topic', '3': '--trigger-bucket' }
const HOSTING = { '1': 'googlecloud', '2': 'firebase' }

exports.preQuestions = () => {}

exports.questions = [{
	question: answers => `project name: ${answers._dest ? `(${sanitizeDest(answers._dest)}) ` : ''} `.cyan,
	answerName: 'projectName',
	defaultValue: answers => answers._dest,
	execute: {
		validate: null,
		onSuccess: answer => sanitizeProjectName(answer)
	},
	files: ['package.json']
},{
	question: () => 'project version: (1.0.0) '.cyan,
	answerName: 'projectVersion',
	defaultValue: () => '1.0.0',
	files: ['package.json']
},{
	question: answers => `Google Cloud Function name : (${sanitizeFunctionName(answers.projectName)}) `.cyan,
	answerName: 'functionName',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => sanitizeFunctionName(answer)
	},
	files: ['appconfig.json']
},{
	question: () => ('Hosting: \n' + 
					'  [1] Google Cloud Functions \n' +
					'  [2] Firebase Functions \n' +
					'Choose one of the above: ([1]) ').cyan,
	answerName: 'hosting',
	defaultValue: () => 1,
	execute: {
		validate: answer => HOSTING[answer],
		onSuccess: answer => HOSTING[answer],
		onError: answer => `'${answer}' is not a valid hosting option.`
	},
	files: ['appconfig.json']
},
// {
// 	question: () => ('Google Cloud Function trigger: \n' + 
// 					'  [1] HTTP \n' +
// 					'  [2] Pub/Sub \n' +
// 					'  [3] Storage \n' +
// 					'Choose one of the above: ([1]) ').cyan,
// 	answerName: 'trigger',
// 	defaultValue: () => 1,
// 	execute: {
// 		validate: answer => TRIGGERS[answer],
// 		onSuccess: answer => TRIGGERS[answer],
// 		onError: answer => `'${answer}' is not a valid trigger.`
// 	},
// 	files: ['appconfig.json']
// },
{
	question: answers => `Google Cloud Function entry-point (no spaces, no hyphens): (${sanitizeEntryPoint(answers.projectName)}) `.cyan,
	answerName: 'entryPoint',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => sanitizeEntryPoint(answer)
	},
	files: ['index.js', 'appconfig.json']
},{
	question: answers => `${answers.hosting == 'googlecloud' ? 'Google Cloud' : 'Firebase'} Project: (${answers.projectName.toLowerCase()}) `.cyan,
	answerName: 'project',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => answer.toLowerCase()
	},
	files: ['appconfig.json']
},{
	question: answers => `Google Cloud Function bucket: (${sanitizeBucket(answers.projectName)}) `.cyan,
	answerName: 'bucket',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => sanitizeBucket(answer)
	},
	files: ['appconfig.json']
}]
