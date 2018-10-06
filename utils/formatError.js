exports.formatJoiError = function formatJoiError(error) {
  const errors = {};
  error.details.map(detail => detail.message).forEach((err) => {
    const [, field, message] = err.split('"');
    errors[field] = field.substring(0, 1).toUpperCase()
                  + field.substring(1, field.length) + message;
  });

  console.log(errors);
  return errors;
};
