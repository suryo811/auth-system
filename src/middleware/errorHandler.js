const errorHandler = (err, req, res, next) => {

    let customError = {
        statusCode: err.statusCode || 500,
        msg: err.message || 'Something went very wrong.',
        status: err.status || 'error'
    }

    return res.status(customError.statusCode).json({ status: customError.status, msg: customError.msg })
}

export default errorHandler