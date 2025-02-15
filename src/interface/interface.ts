export interface UserRequest {
  addRouter: boolean;
  addAxios: boolean;
  addRedux: boolean;
  reduxMiddlewareType: boolean | string | undefined;
  CSSFramework: string;
}

export interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
}

export interface QuestionResponse {
  folderName: string;
  typeOFScript: string;
  packageManger: string;
  packages: string[];
  reduxMiddlewareType?: string;
  cssFramework: string;
}
