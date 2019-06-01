from bs4 import BeautifulSoup as BS
import requests,pprint,json

ProgrammingLanguage = {}

def Pythonerrors():
    url = "https://docs.python.org/3/library/exceptions.html"
    page = requests.get(url)
    soup = BS(page.text,'html.parser')
    ExceptionDivList = soup.find_all('div', attrs={'class':'section'})
    allErrors = []
    for ExceptionDiv in ExceptionDivList:
        allExceptions = ExceptionDiv.find_all('dl')
        for excep in allExceptions:
            name = excep.find('dt').code.get_text().strip()
            description = excep.find('dd').get_text().strip()
            Error = {'errorName':'','description':'','example':'','url':[]}
            Error['errorName']  = name.lower()
            Error['description'] = description
            if(Error not in allErrors):
                allErrors.append(Error)
    ProgrammingLanguage['python'] = allErrors
    with open('data/errorCache.json','w') as file:
        rawData = json.dumps(ProgrammingLanguage,indent=4, sort_keys=True)
        file.write(rawData)
        file.close()
    return ProgrammingLanguage

pythonErrors= Pythonerrors()
pprint.pprint(pythonErrors)
