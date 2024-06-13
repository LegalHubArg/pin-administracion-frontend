import Moment from 'moment';

export const timestampToDateFormat =  (timestamp , format) => {
    //dconsole.log(timestamp)
    Moment.locale('en');
    let date = Moment(timestamp).format(format)
    return date;
  };