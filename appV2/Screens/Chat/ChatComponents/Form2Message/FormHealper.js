import { fieldType } from '../../../../config/Form2config';

const initializeFormAnswers = (formData) => {
    console.log('**** form2 formdata:', formData);
    const answers = []; // used to store data to render the UI. This is not what the form will send to the bot
    _.map(formData, (fieldData, index) => {
        const answer = {
            id: fieldData.id,
            getResponse: () => {}
        };
        if (fieldData.validation) {
            answer.valid = fieldData.value
                ? true
                : fieldData.savedValidationResult;
            answer.validationMessage = fieldData.savedValidationMessage;
        } else {
            answer.valid = true;
        }
        answer.valid = true;
        if (fieldData.mandatory) {
            answer.filled = !!fieldData.value;
        } else {
            answer.filled = true;
        }
        switch (fieldData.type) {
            case fieldType.textField:
                answer.value = fieldData.value || '';
                answer.getResponse = () => answer.value;
                break;
            case fieldType.number:
                answer.value = fieldData.value
                    ? fieldData.value.toString()
                    : '';
                answer.getResponse = () => parseFloat(answer.value);
                break;
            case fieldType.textArea:
                answer.value = fieldData.value || '';
                answer.getResponse = () => answer.value;
                break;
            case fieldType.checkbox:
                answer.value = _.map(fieldData.options, (option) => {
                    if (
                        fieldData.value &&
                        _.includes(fieldData.value, option)
                    ) {
                        return true;
                    }
                    return false;
                });
                answer.getResponse = () =>
                    _.filter(fieldData.options, (option, i) => answer.value[i]);
                break;
            case fieldType.radioButton:
                var v = fieldData.value;
                var presetValue = undefined;
                if (fieldData.options && fieldData.options.length > 0) {
                    presetValue = fieldData.options.indexOf(v);
                }
                answer.value = presetValue; // index
                answer.getResponse = () =>
                    fieldData.options
                        ? fieldData.options[answer.value]
                        : undefined;
                break;
            case fieldType.dropdown:
                answer.value = fieldData.value;
                answer.getResponse = () =>
                    // return fieldData.options ? fieldData.options[answer.value] : undefined
                    answer.value;
                break;
            case fieldType.buttonsField:
                answer.value = fieldData.options;
                answer.getResponse = () => fieldData.options;
                break;
            case fieldType.switch:
                answer.value = fieldData.value || false;
                answer.getResponse = () => answer.value;
                break;
            case fieldType.slider:
                answer.value = fieldData.value || 0;
                answer.getResponse = () => answer.value;
                break;
            case fieldType.date:
                answer.value = fieldData.value ? moment(fieldData.value) : null; // milliseconds. Use getTime() to get the milliseconds to send to backend
                answer.getResponse = () =>
                    answer.value ? answer.value.valueOf() : null;
                break;
            case fieldType.time:
                answer.value = moment({
                    hour: fieldData.value[0],
                    minute: fieldData.value[1]
                }); // [hours, minutes]
                answer.getResponse = () =>
                    answer.value
                        ? [answer.value.hour(), answer.value.minute()]
                        : null;
                break;
            case fieldType.dateTime:
                answer.value = fieldData.value ? moment(fieldData.value) : null; // milliseconds. Use getTime() to get the milliseconds to send to backend
                answer.getResponse = () =>
                    answer.value ? answer.value.valueOf() : null;
                break;
            case fieldType.multiselection:
                answer.value = fieldData.value;
                answer.getResponse = () => answer.value;
                break;
            case fieldType.object_multiselection:
                answer.value = fieldData.value;
                answer.getResponse = () => answer.value;
                break;
            case fieldType.passwordField:
                answer.value = fieldData.value || '';
                answer.getResponse = () => answer.value;
                break;
            case fieldType.lookup:
                answer.value = fieldData.value;
                answer.search = '';
                answer.getResponse = () => answer.value;
                break;
            case fieldType.imageField:
                answer.value = fieldData.value || '';
                answer.getResponse = (action) => {
                    if (action === formAction.CONFIRM) {
                        this.uploadQueue.push({
                            file: answer.value,
                            type: 'IMAGE'
                        });
                    }
                    return answer.value.name;
                };
                answer.validationMessage = 'Could not upload the image';
                answer.valid = true;
                break;
            case fieldType.fileField:
                answer.value = fieldData.value || '';
                answer.getResponse = (action) => {
                    if (action === formAction.CONFIRM) {
                        this.uploadQueue.push({
                            file: answer.value,
                            type: 'FILE'
                        });
                    }
                    return answer.value;
                };
                answer.validationMessage = 'Could not upload the file';
                answer.valid = true;
                break;
            case fieldType.voiceCallField:
                const { number, userId } = fieldData;
                answer.value = { number, userId };
                answer.getResponse = () => answer.value;
                break;
            default:
                answer.value = fieldData.value;
        }
        answers.push(answer);
    });
    return answers;
};

const resetFormAnswers = (answer) => {};

export { initializeFormAnswers, resetFormAnswers };
