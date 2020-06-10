import { models } from './models.js';

const Department = {
    async GetRoot(){

        let groups = await (await models.Department).find({
        });
        for(let index in groups){
            if(groups[index].parent_id == "")
                return groups[index];
        }        
    }
};

export {
    Department
}
  
