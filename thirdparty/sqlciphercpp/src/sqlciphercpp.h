// sqlciphercpp.cpp : 定义 DLL 应用程序的导出函数。
//

#ifdef SQLCIPHERCPP
#define SQLCIPHERCPP_EXPORTS __declspec(dllexport) 
#else
#define	SQLCIPHERCPP_EXPORTS __declspec(dllimport)
#endif

#ifdef __cplusplus
extern "C"
{
#endif
	SQLCIPHERCPP_EXPORTS int add(int num1, int num2);
	SQLCIPHERCPP_EXPORTS char* getString(char* str);

#ifdef __cplusplus
}
#endif
